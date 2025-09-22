"""
Dashboard schemas for request/response validation
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

# Schema for dashboard statistics
class DashboardStats(BaseModel):
    total_documents: int
    pending_approvals: int
    recent_uploads: int
    compliance_rate: float
    unread_notifications: int

# Schema for pending actions
class PendingAction(BaseModel):
    type: str
    document_id: Optional[int] = None
    title: str
    priority: str
    created_at: datetime

# Schema for alerts
class Alert(BaseModel):
    type: str
    message: str
    severity: str  # info, warning, error
    count: Optional[int] = None

# Schema for dashboard overview
class DashboardOverview(BaseModel):
    stats: DashboardStats
    recent_documents: List[Any]  # Will be Document objects
    pending_actions: List[PendingAction]
    alerts: List[Alert]

# Schema for document trends
class DocumentTrendItem(BaseModel):
    date: str
    count: int

class DocumentTrends(BaseModel):
    trends: List[DocumentTrendItem]

# Schema for approval metrics
class ApprovalMetrics(BaseModel):
    total_documents: int
    approved: int
    rejected: int
    pending: int
    approval_rate: float
    rejection_rate: float

# Schema for department statistics
class DepartmentStat(BaseModel):
    total: int
    approved: int
    pending: int
    approval_rate: float

class DepartmentStats(BaseModel):
    stats: Dict[str, DepartmentStat]

# Schema for compliance tracking
class ComplianceItem(BaseModel):
    total: int
    approved: int
    compliance_rate: float

# Schema for date range
class DateRange(BaseModel):
    start: str
    end: str

# Schema for analytics data
class AnalyticsData(BaseModel):
    period: str
    date_range: DateRange
    document_trends: List[DocumentTrendItem]
    approval_metrics: ApprovalMetrics
    department_stats: Dict[str, DepartmentStat]
    compliance_tracking: Dict[str, ComplianceItem]