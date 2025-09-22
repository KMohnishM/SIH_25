"""
Comment schemas for API requests and responses
"""

from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    content: str
    page_number: Optional[int] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    is_internal: bool = False

class CommentCreate(CommentBase):
    parent_id: Optional[int] = None

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_resolved: Optional[bool] = None

class CommentInDBBase(CommentBase):
    id: int
    document_id: int
    author_id: int
    parent_id: Optional[int] = None
    is_resolved: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Comment(CommentInDBBase):
    # Include author information
    author: Optional[dict] = None
    replies: Optional[List['Comment']] = None

class CommentList(BaseModel):
    comments: List[Comment]
    total: int
    page: int
    limit: int

# Update forward references
Comment.model_rebuild()