"""
Notification management endpoints
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.notification import Notification, NotificationType, NotificationPriority
from app.models.user import User
from app.schemas.notification import (
    Notification as NotificationSchema,
    NotificationCreate,
    NotificationUpdate,
    NotificationList,
    NotificationSettings
)
from app.api.deps import get_current_user
from datetime import datetime
import json

router = APIRouter()

@router.get("/", response_model=NotificationList)
async def get_notifications(
    type: Optional[NotificationType] = None,
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get user notifications with filtering and pagination
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # Apply filters
    if type:
        query = query.filter(Notification.type == type)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get total count
    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Apply pagination and ordering
    offset = (page - 1) * limit
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "limit": limit
    }

@router.put("/{notification_id}/read", response_model=NotificationSchema)
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark notification as read
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    
    return notification

@router.put("/read-all")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark all user notifications as read
    """
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"updated_count": updated_count}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}

@router.get("/settings", response_model=NotificationSettings)
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user notification settings
    """
    # Parse notification settings from user profile
    if current_user.notification_settings:
        settings = json.loads(current_user.notification_settings)
    else:
        # Default settings
        settings = {
            "email": {
                "document_approval": True,
                "deadline_reminders": True,
                "system_updates": True,
                "comments": True
            },
            "push": {
                "document_approval": True,
                "deadline_reminders": True,
                "system_updates": False,
                "comments": True
            },
            "frequency": "immediate"
        }
    
    return settings

@router.put("/settings", response_model=NotificationSettings)
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update user notification settings
    """
    # Update user notification settings
    current_user.notification_settings = json.dumps(settings.dict())
    db.commit()
    db.refresh(current_user)
    
    return settings

@router.post("/", response_model=NotificationSchema)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create notification (for testing/admin purposes)
    """
    # Only admin can create notifications manually
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    notification = Notification(
        title=notification_data.title,
        message=notification_data.message,
        type=notification_data.type,
        priority=notification_data.priority,
        user_id=notification_data.user_id,
        document_id=notification_data.document_id,
        action_required=notification_data.action_required,
        extra_data=json.dumps(notification_data.extra_data) if notification_data.extra_data else None
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification