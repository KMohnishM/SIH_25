"""
Comment model for document annotations and discussions
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Content
    content = Column(Text, nullable=False)
    
    # Position for annotations (optional)
    page_number = Column(Integer, nullable=True)
    position_x = Column(Integer, nullable=True)
    position_y = Column(Integer, nullable=True)
    
    # Relationships
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # For replies
    
    # Status
    is_resolved = Column(Boolean, default=False)
    is_internal = Column(Boolean, default=False)  # Internal comments vs public
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id])
    replies = relationship("Comment", cascade="all, delete-orphan", overlaps="parent")