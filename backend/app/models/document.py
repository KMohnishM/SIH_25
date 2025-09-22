"""
Document model for document management
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class DocumentType(str, enum.Enum):
    safety = "safety"
    maintenance = "maintenance"
    compliance = "compliance"
    finance = "finance"
    operations = "operations"
    training = "training"

class DocumentStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    archived = "archived"

class DocumentPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    
    # Content and metadata
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # Extracted text content
    
    # Classification
    type = Column(Enum(DocumentType), nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.draft, index=True)
    priority = Column(Enum(DocumentPriority), default=DocumentPriority.medium, index=True)
    
    # File information
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    
    # Document properties
    version = Column(String(20), default="1.0")
    page_count = Column(Integer, nullable=True)
    
    # User relationships
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Workflow
    approval_required = Column(Boolean, default=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    
    # Engagement metrics
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    
    # Bookmarking
    bookmarked_by = Column(Text, nullable=True)  # JSON array of user IDs
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    uploader = relationship("User", back_populates="documents", foreign_keys=[uploaded_by])
    approver = relationship("User", foreign_keys=[approved_by])
    comments = relationship("Comment", back_populates="document", cascade="all, delete-orphan")
    workflow_history = relationship("WorkflowHistory", back_populates="document", cascade="all, delete-orphan")

class WorkflowHistory(Base):
    __tablename__ = "workflow_history"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    action = Column(String(50), nullable=False)  # approve, reject, request_revision, etc.
    comments = Column(Text, nullable=True)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="workflow_history")
    user = relationship("User")