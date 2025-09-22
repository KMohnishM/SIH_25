"""
Notification schemas for request/response validation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, field_validator
import json

from app.models.notification import NotificationType, NotificationPriority

# Base notification schema
class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.medium

# Schema for notification creation
class NotificationCreate(NotificationBase):
    user_id: int
    document_id: Optional[int] = None
    action_required: bool = False
    extra_data: Optional[Dict[str, Any]] = None

# Schema for notification update
class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[NotificationPriority] = None
    is_read: Optional[bool] = None

# Schema for notification response
class Notification(NotificationBase):
    id: int
    user_id: int
    document_id: Optional[int] = None
    is_read: bool
    action_required: bool
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    read_at: Optional[datetime] = None
    
    @field_validator('extra_data', mode='before')
    @classmethod
    def parse_extra_data(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return {}
        elif isinstance(v, dict):
            return v
        return {}
    
    class Config:
        from_attributes = True

# Schema for notification lists
class NotificationList(BaseModel):
    notifications: List[Notification]
    total: int
    unread_count: int
    page: int
    limit: int

# Schema for notification settings
class EmailSettings(BaseModel):
    document_approval: bool = True
    deadline_reminders: bool = True
    system_updates: bool = True
    comments: bool = True

class PushSettings(BaseModel):
    document_approval: bool = True
    deadline_reminders: bool = True
    system_updates: bool = False
    comments: bool = True

class NotificationSettings(BaseModel):
    email: EmailSettings
    push: PushSettings
    frequency: str = "immediate"  # immediate, daily, weekly