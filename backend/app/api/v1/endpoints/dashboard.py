"""
Dashboard and analytics endpoints
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app.core.database import get_db
from app.models.document import Document, DocumentStatus, DocumentType, DocumentPriority
from app.models.notification import Notification
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverview,
    AnalyticsData,
    DocumentTrends,
    DepartmentStats
)
from app.api.deps import get_current_user
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get dashboard overview data
    """
    # Basic document statistics
    total_documents = db.query(Document).count()
    pending_approvals = db.query(Document).filter(
        Document.status == DocumentStatus.pending
    ).count()
    
    # Recent uploads (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_uploads = db.query(Document).filter(
        Document.created_at >= seven_days_ago
    ).count()
    
    # Compliance rate (approved vs total documents)
    approved_documents = db.query(Document).filter(
        Document.status == DocumentStatus.approved
    ).count()
    compliance_rate = (approved_documents / total_documents * 100) if total_documents > 0 else 0
    
    # Recent documents for user
    recent_documents_query = db.query(Document)
    
    # Filter based on user role and department
    if current_user.role not in ["admin", "executive"]:
        recent_documents_query = recent_documents_query.filter(
            or_(
                Document.department == current_user.department,
                Document.uploaded_by == current_user.id
            )
        )
    
    recent_documents = recent_documents_query.order_by(
        Document.created_at.desc()
    ).limit(5).all()
    
    # Pending actions for user
    pending_actions = []
    
    # Documents pending approval (for approvers)
    if current_user.role in ["admin", "executive"]:
        pending_docs = db.query(Document).filter(
            Document.status == DocumentStatus.pending
        ).limit(10).all()
        
        for doc in pending_docs:
            pending_actions.append({
                "type": "approval_required",
                "document_id": doc.id,
                "title": doc.title,
                "priority": doc.priority.value,
                "created_at": doc.created_at
            })
    
    # User's unread notifications
    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Alerts (high priority items)
    alerts = []
    
    # High priority pending documents
    high_priority_pending = db.query(Document).filter(
        and_(
            Document.status == DocumentStatus.pending,
            Document.priority.in_([DocumentPriority.high, DocumentPriority.urgent])
        )
    ).count()
    
    if high_priority_pending > 0:
        alerts.append({
            "type": "high_priority_pending",
            "message": f"{high_priority_pending} high priority documents awaiting approval",
            "severity": "warning",
            "count": high_priority_pending
        })
    
    # Overdue documents (if deadline passed)
    overdue_count = db.query(Document).filter(
        and_(
            Document.deadline < datetime.utcnow(),
            Document.status == DocumentStatus.pending
        )
    ).count()
    
    if overdue_count > 0:
        alerts.append({
            "type": "overdue_documents",
            "message": f"{overdue_count} documents are overdue for approval",
            "severity": "error",
            "count": overdue_count
        })
    
    return {
        "stats": {
            "total_documents": total_documents,
            "pending_approvals": pending_approvals,
            "recent_uploads": recent_uploads,
            "compliance_rate": round(compliance_rate, 1),
            "unread_notifications": unread_notifications
        },
        "recent_documents": recent_documents,
        "pending_actions": pending_actions,
        "alerts": alerts
    }

@router.get("/analytics", response_model=AnalyticsData)
async def get_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    department: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get detailed analytics data
    """
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    else:  # year
        start_date = now - timedelta(days=365)
    
    # Base query with date filter
    base_query = db.query(Document).filter(Document.created_at >= start_date)
    
    # Filter by department if specified
    if department:
        base_query = base_query.filter(Document.department == department)
    
    # Document trends (uploads over time)
    document_trends = []
    for i in range(7 if period == "week" else 30):
        day_start = now - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_count = base_query.filter(
            and_(
                Document.created_at >= day_start,
                Document.created_at < day_end
            )
        ).count()
        
        document_trends.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": day_count
        })
    
    document_trends.reverse()  # Chronological order
    
    # Approval metrics
    total_in_period = base_query.count()
    approved_in_period = base_query.filter(
        Document.status == DocumentStatus.approved
    ).count()
    rejected_in_period = base_query.filter(
        Document.status == DocumentStatus.rejected
    ).count()
    pending_in_period = base_query.filter(
        Document.status == DocumentStatus.pending
    ).count()
    
    approval_rate = (approved_in_period / total_in_period * 100) if total_in_period > 0 else 0
    rejection_rate = (rejected_in_period / total_in_period * 100) if total_in_period > 0 else 0
    
    approval_metrics = {
        "total_documents": total_in_period,
        "approved": approved_in_period,
        "rejected": rejected_in_period,
        "pending": pending_in_period,
        "approval_rate": round(approval_rate, 1),
        "rejection_rate": round(rejection_rate, 1)
    }
    
    # Department statistics
    dept_stats_query = db.query(
        Document.department,
        func.count(Document.id).label('total'),
        func.sum(func.case([(Document.status == DocumentStatus.approved, 1)], else_=0)).label('approved'),
        func.sum(func.case([(Document.status == DocumentStatus.pending, 1)], else_=0)).label('pending')
    ).filter(Document.created_at >= start_date).group_by(Document.department)
    
    department_stats = {}
    for dept, total, approved, pending in dept_stats_query.all():
        department_stats[dept] = {
            "total": total,
            "approved": approved or 0,
            "pending": pending or 0,
            "approval_rate": round((approved or 0) / total * 100, 1) if total > 0 else 0
        }
    
    # Compliance tracking by document type
    type_stats_query = db.query(
        Document.type,
        func.count(Document.id).label('total'),
        func.sum(func.case([(Document.status == DocumentStatus.approved, 1)], else_=0)).label('approved')
    ).filter(Document.created_at >= start_date).group_by(Document.type)
    
    compliance_tracking = {}
    for doc_type, total, approved in type_stats_query.all():
        compliance_rate = (approved or 0) / total * 100 if total > 0 else 0
        compliance_tracking[doc_type.value] = {
            "total": total,
            "approved": approved or 0,
            "compliance_rate": round(compliance_rate, 1)
        }
    
    return {
        "period": period,
        "date_range": {
            "start": start_date.isoformat(),
            "end": now.isoformat()
        },
        "document_trends": document_trends,
        "approval_metrics": approval_metrics,
        "department_stats": department_stats,
        "compliance_tracking": compliance_tracking
    }