"""
Document schemas for request/response validation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, field_validator
import json

from app.models.document import DocumentType, DocumentStatus, DocumentPriority

# Base document schema
class DocumentBase(BaseModel):
    title: str
    summary: Optional[str] = None
    type: DocumentType
    department: str
    priority: DocumentPriority = DocumentPriority.medium
    approval_required: bool = True
    deadline: Optional[datetime] = None

# Schema for document creation
class DocumentCreate(DocumentBase):
    pass

# Schema for document update
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    type: Optional[DocumentType] = None
    department: Optional[str] = None
    priority: Optional[DocumentPriority] = None
    deadline: Optional[datetime] = None

# Schema for document response
class Document(DocumentBase):
    id: int
    status: DocumentStatus
    file_path: str
    file_name: str
    file_type: str
    file_size: int
    version: str
    page_count: Optional[int] = None
    uploaded_by: int
    approved_by: Optional[int] = None
    view_count: int = 0
    download_count: int = 0
    bookmarked_by: List[int] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    @field_validator('bookmarked_by', mode='before')
    @classmethod
    def parse_bookmarked_by(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        elif isinstance(v, list):
            return v
        return []
    
    class Config:
        from_attributes = True

# Schema for document list response
class DocumentList(BaseModel):
    documents: List[Document]
    total: int
    page: int
    limit: int
    pages: int

# Schema for document filters
class DocumentFilters(BaseModel):
    type: Optional[DocumentType] = None
    department: Optional[str] = None
    status: Optional[DocumentStatus] = None
    priority: Optional[DocumentPriority] = None
    uploaded_by: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None
    page: int = 1
    limit: int = 20
    
    @field_validator('limit')
    @classmethod
    def limit_validator(cls, v):
        if v > 100:
            return 100
        return v

# Schema for document approval/rejection
class DocumentApproval(BaseModel):
    action: str  # approve, reject
    comments: Optional[str] = None
    conditions: Optional[List[str]] = None

class DocumentApprovalResponse(BaseModel):
    document_id: int
    action: str
    approved_by: int
    comments: Optional[str] = None
    timestamp: datetime

# Schema for workflow history
class WorkflowHistoryItem(BaseModel):
    id: int
    action: str
    comments: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    timestamp: datetime
    user_id: int
    
    class Config:
        from_attributes = True

class WorkflowHistory(BaseModel):
    workflow: List[WorkflowHistoryItem]

# Schema for document statistics
class DocumentStats(BaseModel):
    total_documents: int
    pending_approvals: int
    approved_documents: int
    rejected_documents: int
    by_type: Dict[str, int]
    by_department: Dict[str, int]
    by_priority: Dict[str, int]