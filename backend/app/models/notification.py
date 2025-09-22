"""
Notification model for user notifications
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class NotificationType(str, enum.Enum):
    document_action = "document_action"
    system = "system"
    comment = "comment"
    deadline_reminder = "deadline_reminder"
    approval_request = "approval_request"

class NotificationPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Classification
    type = Column(Enum(NotificationType), nullable=False, index=True)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.medium)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Related entities
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    # Status
    is_read = Column(Boolean, default=False, index=True)
    action_required = Column(Boolean, default=False)
    
    # Additional data (JSON string)
    extra_data = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    document = relationship("Document")