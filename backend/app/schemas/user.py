"""
User schemas for request/response validation
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
import json

from app.models.user import UserRole, UserDepartment

# Base user schema
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.user
    department: UserDepartment = UserDepartment.general
    language_preference: str = "en"
    is_active: bool = True

# Schema for user creation
class UserCreate(UserBase):
    password: str
    permissions: Optional[List[str]] = None

# Schema for user update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[UserDepartment] = None
    language_preference: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[List[str]] = None
    notification_settings: Optional[dict] = None

# Schema for user profile update
class UserProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    language_preference: Optional[str] = None
    notification_settings: Optional[dict] = None

# Schema for password change
class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Schema for user response
class User(UserBase):
    id: int
    permissions: List[str] = []
    notification_settings: Optional[dict] = None
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    @field_validator('permissions', mode='before')
    @classmethod
    def parse_permissions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        elif isinstance(v, list):
            return v
        return []
    
    @field_validator('notification_settings', mode='before')
    @classmethod
    def parse_notification_settings(cls, v):
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

# Schema for user in lists
class UserInDB(User):
    hashed_password: str

# Login schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None