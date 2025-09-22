"""
Comments & Annotations endpoints
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.comment import Comment
from app.models.document import Document
from app.models.user import User
from app.schemas.comment import (
    Comment as CommentSchema,
    CommentCreate,
    CommentUpdate,
    CommentList
)
from app.api.deps import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/{document_id}/comments", response_model=CommentList)
async def get_document_comments(
    document_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    include_internal: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get comments for a document
    """
    # Check if document exists
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Build query for top-level comments (no parent)
    query = db.query(Comment).filter(
        Comment.document_id == document_id,
        Comment.parent_id.is_(None)
    )
    
    # Filter internal comments based on permissions
    if not include_internal or current_user.role not in ["admin", "executive"]:
        query = query.filter(Comment.is_internal == False)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    offset = (page - 1) * limit
    comments = query.order_by(
        Comment.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    # Enrich comments with author info and replies
    enriched_comments = []
    for comment in comments:
        comment_dict = {
            "id": comment.id,
            "content": comment.content,
            "page_number": comment.page_number,
            "position_x": comment.position_x,
            "position_y": comment.position_y,
            "is_internal": comment.is_internal,
            "document_id": comment.document_id,
            "author_id": comment.author_id,
            "parent_id": comment.parent_id,
            "is_resolved": comment.is_resolved,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author": {
                "id": comment.author.id,
                "username": comment.author.username,
                "full_name": comment.author.full_name,
                "role": comment.author.role
            } if comment.author else None,
            "replies": []
        }
        
        # Get replies for this comment
        replies = db.query(Comment).filter(
            Comment.parent_id == comment.id
        ).order_by(Comment.created_at.asc()).all()
        
        for reply in replies:
            if not reply.is_internal or include_internal:
                reply_dict = {
                    "id": reply.id,
                    "content": reply.content,
                    "page_number": reply.page_number,
                    "position_x": reply.position_x,
                    "position_y": reply.position_y,
                    "is_internal": reply.is_internal,
                    "document_id": reply.document_id,
                    "author_id": reply.author_id,
                    "parent_id": reply.parent_id,
                    "is_resolved": reply.is_resolved,
                    "created_at": reply.created_at,
                    "updated_at": reply.updated_at,
                    "author": {
                        "id": reply.author.id,
                        "username": reply.author.username,
                        "full_name": reply.author.full_name,
                        "role": reply.author.role
                    } if reply.author else None,
                    "replies": None
                }
                comment_dict["replies"].append(reply_dict)
        
        enriched_comments.append(comment_dict)
    
    return {
        "comments": enriched_comments,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("/{document_id}/comments", response_model=CommentSchema)
async def create_comment(
    document_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Add comment to document
    """
    # Check if document exists
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # If replying to a comment, check if parent comment exists
    if comment_data.parent_id:
        parent_comment = db.query(Comment).filter(
            Comment.id == comment_data.parent_id,
            Comment.document_id == document_id
        ).first()
        if not parent_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent comment not found"
            )
    
    # Create comment
    comment = Comment(
        content=comment_data.content,
        page_number=comment_data.page_number,
        position_x=comment_data.position_x,
        position_y=comment_data.position_y,
        is_internal=comment_data.is_internal,
        document_id=document_id,
        author_id=current_user.id,
        parent_id=comment_data.parent_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Create notification for document owner (if not the commenter)
    if document.uploaded_by != current_user.id:
        from app.models.notification import Notification, NotificationType, NotificationPriority
        notification = Notification(
            title="New Comment on Document",
            message=f"{current_user.full_name or current_user.username} commented on {document.title}",
            type=NotificationType.comment,
            priority=NotificationPriority.medium,
            user_id=document.uploaded_by,
            document_id=document_id
        )
        db.add(notification)
        db.commit()
    
    # Enrich comment with author info
    comment_dict = {
        "id": comment.id,
        "content": comment.content,
        "page_number": comment.page_number,
        "position_x": comment.position_x,
        "position_y": comment.position_y,
        "is_internal": comment.is_internal,
        "document_id": comment.document_id,
        "author_id": comment.author_id,
        "parent_id": comment.parent_id,
        "is_resolved": comment.is_resolved,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "author": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "role": current_user.role
        },
        "replies": []
    }
    
    return comment_dict

@router.put("/comments/{comment_id}", response_model=CommentSchema)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update comment
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check permissions - only author or admin can edit
    if comment.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this comment"
        )
    
    # Update fields
    update_data = comment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(comment, field, value)
    
    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)
    
    # Enrich comment with author info
    comment_dict = {
        "id": comment.id,
        "content": comment.content,
        "page_number": comment.page_number,
        "position_x": comment.position_x,
        "position_y": comment.position_y,
        "is_internal": comment.is_internal,
        "document_id": comment.document_id,
        "author_id": comment.author_id,
        "parent_id": comment.parent_id,
        "is_resolved": comment.is_resolved,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "author": {
            "id": comment.author.id,
            "username": comment.author.username,
            "full_name": comment.author.full_name,
            "role": comment.author.role
        } if comment.author else None,
        "replies": []
    }
    
    return comment_dict

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete comment
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check permissions - only author or admin can delete
    if comment.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    # Delete comment and all replies (cascade handled by SQLAlchemy)
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}