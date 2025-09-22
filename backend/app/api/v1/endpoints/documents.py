"""
Document management endpoints
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.core.database import get_db
from app.models.document import Document, DocumentStatus, DocumentType, DocumentPriority, WorkflowHistory
from app.models.user import User
from app.schemas.document import (
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    DocumentList,
    DocumentFilters,
    DocumentApproval,
    DocumentApprovalResponse,
    WorkflowHistory as WorkflowHistorySchema,
    DocumentStats
)
from app.api.deps import get_current_user, get_current_active_superuser
import os
import shutil
from datetime import datetime
import json

router = APIRouter()

@router.get("/", response_model=DocumentList)
async def get_documents(
    type: Optional[DocumentType] = None,
    department: Optional[str] = None,
    status: Optional[DocumentStatus] = None,
    priority: Optional[DocumentPriority] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get documents with filtering and pagination
    """
    query = db.query(Document)
    
    # Apply filters
    if type:
        query = query.filter(Document.type == type)
    if department:
        query = query.filter(Document.department == department)
    if status:
        query = query.filter(Document.status == status)
    if priority:
        query = query.filter(Document.priority == priority)
    if search:
        query = query.filter(
            or_(
                Document.title.ilike(f"%{search}%"),
                Document.summary.ilike(f"%{search}%"),
                Document.content.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    documents = query.offset(offset).limit(limit).all()
    
    # Calculate pages
    pages = (total + limit - 1) // limit
    
    return {
        "documents": documents,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get single document by ID
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Increment view count
    document.view_count += 1
    db.commit()
    
    return document

@router.post("/", response_model=DocumentSchema)
async def create_document(
    title: str = Form(...),
    summary: Optional[str] = Form(None),
    type: DocumentType = Form(...),
    department: str = Form(...),
    priority: DocumentPriority = Form(DocumentPriority.medium),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Upload and create new document
    """
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed"
        )
    
    # Create upload directory if not exists
    upload_dir = "uploads/documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = f"{upload_dir}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create document record
    document = Document(
        title=title,
        summary=summary,
        type=type,
        department=department,
        priority=priority,
        file_path=file_path,
        file_name=file.filename,
        file_type=file_extension[1:],  # Remove the dot
        file_size=file_size,
        uploaded_by=current_user.id,
        status=DocumentStatus.pending if current_user.role != "admin" else DocumentStatus.approved
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Create workflow history entry
    workflow_entry = WorkflowHistory(
        document_id=document.id,
        user_id=current_user.id,
        action="uploaded",
        new_status=document.status.value
    )
    db.add(workflow_entry)
    db.commit()
    
    return document

@router.put("/{document_id}", response_model=DocumentSchema)
async def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update document metadata
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if document.uploaded_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update fields
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete document (soft delete by changing status)
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if document.uploaded_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Soft delete
    document.status = DocumentStatus.archived
    db.commit()
    
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/approve", response_model=DocumentApprovalResponse)
async def approve_document(
    document_id: int,
    approval_data: DocumentApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Approve document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if user can approve
    if current_user.role not in ["admin", "executive"] and current_user.department != document.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve documents"
        )
    
    previous_status = document.status
    document.status = DocumentStatus.approved
    document.approved_by = current_user.id
    document.approved_at = datetime.utcnow()
    
    db.commit()
    
    # Create workflow history entry
    workflow_entry = WorkflowHistory(
        document_id=document.id,
        user_id=current_user.id,
        action="approve",
        comments=approval_data.comments,
        previous_status=previous_status.value,
        new_status=document.status.value
    )
    db.add(workflow_entry)
    db.commit()
    
    return {
        "document_id": document.id,
        "action": "approve",
        "approved_by": current_user.id,
        "comments": approval_data.comments,
        "timestamp": datetime.utcnow()
    }

@router.post("/{document_id}/reject", response_model=DocumentApprovalResponse)
async def reject_document(
    document_id: int,
    approval_data: DocumentApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Reject document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if user can reject
    if current_user.role not in ["admin", "executive"] and current_user.department != document.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reject documents"
        )
    
    previous_status = document.status
    document.status = DocumentStatus.rejected
    
    db.commit()
    
    # Create workflow history entry
    workflow_entry = WorkflowHistory(
        document_id=document.id,
        user_id=current_user.id,
        action="reject",
        comments=approval_data.comments,
        previous_status=previous_status.value,
        new_status=document.status.value
    )
    db.add(workflow_entry)
    db.commit()
    
    return {
        "document_id": document.id,
        "action": "reject",
        "approved_by": current_user.id,
        "comments": approval_data.comments,
        "timestamp": datetime.utcnow()
    }

@router.get("/{document_id}/workflow", response_model=WorkflowHistorySchema)
async def get_document_workflow(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get document workflow history
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    workflow = db.query(WorkflowHistory).filter(
        WorkflowHistory.document_id == document_id
    ).order_by(WorkflowHistory.timestamp.desc()).all()
    
    return {"workflow": workflow}

@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Download document file
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Increment download count
    document.download_count += 1
    db.commit()
    
    # In a real implementation, you would return FileResponse
    return {"download_url": f"/static/documents/{document.file_name}"}

@router.get("/{document_id}/preview")
async def preview_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get document preview/thumbnail
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # In a real implementation, you would generate/return preview image
    return {
        "preview_url": f"/static/previews/{document.id}.jpg",
        "thumbnail_url": f"/static/thumbnails/{document.id}.jpg"
    }

@router.post("/{document_id}/request-revision")
async def request_document_revision(
    document_id: int,
    revision_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Request document revision
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if user can request revision
    if current_user.role not in ["admin", "executive"] and current_user.department != document.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to request document revisions"
        )
    
    previous_status = document.status
    document.status = DocumentStatus.draft  # Set back to draft for revision
    
    db.commit()
    
    # Create workflow history entry
    workflow_entry = WorkflowHistory(
        document_id=document.id,
        user_id=current_user.id,
        action="request_revision",
        comments=f"Requested changes: {', '.join(revision_data.get('requested_changes', []))}",
        previous_status=previous_status.value,
        new_status=document.status.value
    )
    db.add(workflow_entry)
    db.commit()
    
    # Create notification for document owner
    from app.models.notification import Notification, NotificationType, NotificationPriority
    notification = Notification(
        title="Document Revision Requested",
        message=f"Revision requested for {document.title}",
        type=NotificationType.document_action,
        priority=NotificationPriority.high,
        user_id=document.uploaded_by,
        document_id=document_id
    )
    db.add(notification)
    db.commit()
    
    return {
        "revision_request": {
            "id": workflow_entry.id,
            "changes": revision_data.get('requested_changes', []),
            "deadline": revision_data.get('deadline'),
            "requested_by": current_user.id,
            "timestamp": datetime.utcnow()
        }
    }

@router.get("/stats/overview", response_model=DocumentStats)
async def get_document_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get document statistics overview
    """
    total_documents = db.query(Document).count()
    pending_approvals = db.query(Document).filter(Document.status == DocumentStatus.pending).count()
    approved_documents = db.query(Document).filter(Document.status == DocumentStatus.approved).count()
    rejected_documents = db.query(Document).filter(Document.status == DocumentStatus.rejected).count()
    
    # Stats by type
    type_stats = db.query(
        Document.type, func.count(Document.id)
    ).group_by(Document.type).all()
    by_type = {str(type_name): count for type_name, count in type_stats}
    
    # Stats by department
    dept_stats = db.query(
        Document.department, func.count(Document.id)
    ).group_by(Document.department).all()
    by_department = {dept: count for dept, count in dept_stats}
    
    # Stats by priority
    priority_stats = db.query(
        Document.priority, func.count(Document.id)
    ).group_by(Document.priority).all()
    by_priority = {str(priority): count for priority, count in priority_stats}
    
    return {
        "total_documents": total_documents,
        "pending_approvals": pending_approvals,
        "approved_documents": approved_documents,
        "rejected_documents": rejected_documents,
        "by_type": by_type,
        "by_department": by_department,
        "by_priority": by_priority
    }