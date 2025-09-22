"""
User model for authentication and user management
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    executive = "executive"
    maintenance = "maintenance"
    compliance = "compliance"
    finance = "finance"
    user = "user"

class UserDepartment(str, enum.Enum):
    management = "management"
    engineering = "engineering"
    operations = "operations"
    legal_compliance = "legal_compliance"
    finance = "finance"
    general = "general"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    full_name = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    department = Column(Enum(UserDepartment), default=UserDepartment.general, nullable=False)
    
    # Permissions (JSON array stored as text)
    permissions = Column(Text, nullable=True)  # JSON string
    
    # Settings
    language_preference = Column(String(10), default="en")
    notification_settings = Column(Text, nullable=True)  # JSON string
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    documents = relationship("Document", back_populates="uploader", foreign_keys="Document.uploaded_by")
    comments = relationship("Comment", back_populates="author")
    notifications = relationship("Notification", back_populates="user")
    
    @property
    def permissions_list(self):
        """Convert permissions JSON string to list"""
        if self.permissions:
            import json
            try:
                return json.loads(self.permissions)
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    @property
    def notification_settings_dict(self):
        """Convert notification_settings JSON string to dict"""
        if self.notification_settings:
            import json
            try:
                return json.loads(self.notification_settings)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}