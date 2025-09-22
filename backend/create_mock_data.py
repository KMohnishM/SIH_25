#!/usr/bin/env python3
"""
Script to create comprehensive mock data for the KMRL Document Management System
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.user import User, UserRole, UserDepartment
from app.models.document import Document, DocumentType, DocumentStatus, DocumentPriority, WorkflowHistory
from app.models.comment import Comment
from app.models.notification import Notification, NotificationType, NotificationPriority
from app.core.security import get_password_hash
import json
from datetime import datetime, timedelta
import random

def create_mock_data():
    """Create comprehensive mock data for testing"""
    
    # Create database session
    db = Session(engine)
    
    try:
        print("Creating mock data for KMRL Document Management System...")
        
        # 1. Create Users
        print("1. Creating users...")
        demo_users = [
            {
                "username": "executive.user",
                "email": "executive@kmrl.co.in",
                "full_name": "Executive Director",
                "role": UserRole.executive,
                "department": UserDepartment.management,
                "permissions": ["read_documents", "upload_documents", "approve_documents", "view_analytics"],
                "password": "demo123"
            },
            {
                "username": "maintenance.engineer",
                "email": "maintenance@kmrl.co.in",
                "full_name": "Maintenance Engineer",
                "role": UserRole.maintenance,
                "department": UserDepartment.engineering,
                "permissions": ["read_documents", "upload_documents"],
                "password": "demo123"
            },
            {
                "username": "compliance.officer",
                "email": "compliance@kmrl.co.in",
                "full_name": "Compliance Officer",
                "role": UserRole.compliance,
                "department": UserDepartment.legal_compliance,
                "permissions": ["read_documents", "upload_documents", "approve_documents"],
                "password": "demo123"
            },
            {
                "username": "finance.manager",
                "email": "finance@kmrl.co.in",
                "full_name": "Finance Manager",
                "role": UserRole.finance,
                "department": UserDepartment.finance,
                "permissions": ["read_documents", "upload_documents", "approve_documents"],
                "password": "demo123"
            },
            {
                "username": "operations.manager",
                "email": "operations@kmrl.co.in",
                "full_name": "Operations Manager",
                "role": UserRole.user,
                "department": UserDepartment.operations,
                "permissions": ["read_documents", "upload_documents"],
                "password": "demo123"
            },
            {
                "username": "safety.officer",
                "email": "safety@kmrl.co.in",
                "full_name": "Safety Officer",
                "role": UserRole.user,
                "department": UserDepartment.operations,
                "permissions": ["read_documents", "upload_documents"],
                "password": "demo123"
            },
            {
                "username": "admin.user",
                "email": "admin@kmrl.co.in",
                "full_name": "System Administrator",
                "role": UserRole.admin,
                "department": UserDepartment.management,
                "permissions": ["read_documents", "upload_documents", "approve_documents", "manage_users", "view_analytics", "system_admin"],
                "password": "admin123"
            }
        ]
        
        users = {}
        for user_data in demo_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                users[user_data["username"]] = existing_user
                continue
            
            # Create new user
            hashed_password = get_password_hash(user_data["password"])
            
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=hashed_password,
                role=user_data["role"],
                department=user_data["department"],
                permissions=json.dumps(user_data["permissions"]),
                is_active=True,
                is_verified=True,
                language_preference="en",
                notification_settings=json.dumps({
                    "email_notifications": True,
                    "push_notifications": True,
                    "document_approvals": True,
                    "deadline_reminders": True
                })
            )
            
            db.add(new_user)
            users[user_data["username"]] = new_user
        
        db.commit()
        print(f"Created {len(demo_users)} users")
        
        # 2. Create Documents
        print("2. Creating documents...")
        now = datetime.now()
        
        mock_documents = [
            {
                "title": "Safety Protocol Update - Line 1 Operations",
                "summary": "Updated safety protocols for Line 1 operations including new emergency procedures and passenger safety guidelines.",
                "content": "This document outlines the revised safety protocols for Line 1 metro operations. Key updates include enhanced emergency evacuation procedures, new passenger safety measures, and updated staff training requirements. All staff must review and acknowledge these changes within 30 days.",
                "type": DocumentType.safety,
                "department": "operations",
                "status": DocumentStatus.approved,
                "priority": DocumentPriority.high,
                "file_name": "safety-protocol-line1-v2.1.pdf",
                "file_type": "pdf",
                "file_size": 2457600,  # 2.4 MB
                "uploaded_by": "safety.officer",
                "approved_by": "executive.user",
                "version": "2.1",
                "page_count": 45,
                "approval_required": True,
                "created_at": now - timedelta(days=5),
                "approved_at": now - timedelta(days=2)
            },
            {
                "title": "Maintenance Schedule Q4 2024",
                "summary": "Quarterly maintenance schedule for all metro lines including rolling stock, track infrastructure, and station facilities.",
                "content": "Q4 2024 maintenance activities include comprehensive track inspections, rolling stock overhauls, escalator maintenance, and platform safety upgrades. Coordination with operations team required for service disruptions.",
                "type": DocumentType.maintenance,
                "department": "engineering",
                "status": DocumentStatus.approved,
                "priority": DocumentPriority.medium,
                "file_name": "maintenance-schedule-q4-2024.pdf",
                "file_type": "pdf",
                "file_size": 1888256,  # 1.8 MB
                "uploaded_by": "maintenance.engineer",
                "approved_by": "operations.manager",
                "version": "1.0",
                "page_count": 23,
                "approval_required": True,
                "created_at": now - timedelta(days=10),
                "approved_at": now - timedelta(days=7)
            },
            {
                "title": "New Regulation Compliance - Ministry Guidelines",
                "summary": "Latest ministry guidelines for metro operations compliance including environmental standards and accessibility requirements.",
                "content": "New regulatory framework from Ministry of Railways covering environmental compliance, accessibility standards for differently-abled passengers, and updated safety certifications. Implementation deadline: March 2025.",
                "type": DocumentType.compliance,
                "department": "legal_compliance",
                "status": DocumentStatus.pending,
                "priority": DocumentPriority.urgent,
                "file_name": "ministry-guidelines-2024.pdf",
                "file_type": "pdf",
                "file_size": 3355443,  # 3.2 MB
                "uploaded_by": "compliance.officer",
                "approved_by": None,
                "version": "1.0",
                "page_count": 67,
                "approval_required": True,
                "deadline": now + timedelta(days=30),
                "created_at": now - timedelta(days=3)
            },
            {
                "title": "Monthly Revenue Report - November 2024",
                "summary": "Monthly revenue and expenditure analysis including ridership statistics and financial projections.",
                "content": "November 2024 financial performance shows 15% increase in ridership compared to previous month. Revenue targets exceeded by 8%. Key metrics include ticket sales, advertising income, and operational expenses.",
                "type": DocumentType.finance,
                "department": "finance",
                "status": DocumentStatus.approved,
                "priority": DocumentPriority.low,
                "file_name": "revenue-report-nov-2024.xlsx",
                "file_type": "xlsx",
                "file_size": 876544,  # 856 KB
                "uploaded_by": "finance.manager",
                "approved_by": "executive.user",
                "version": "1.0",
                "page_count": 12,
                "approval_required": True,
                "created_at": now - timedelta(days=15),
                "approved_at": now - timedelta(days=12)
            },
            {
                "title": "Emergency Response Plan - Station Evacuation",
                "summary": "Comprehensive emergency response procedures for station evacuation scenarios including fire, medical emergencies, and security threats.",
                "content": "Detailed protocols for emergency evacuation covering fire emergencies, medical incidents, security threats, and natural disasters. Includes coordination with local emergency services, passenger communication procedures, and staff responsibilities.",
                "type": DocumentType.safety,
                "department": "operations",
                "status": DocumentStatus.pending,
                "priority": DocumentPriority.high,
                "file_name": "emergency-response-plan-v3.pdf",
                "file_type": "pdf",
                "file_size": 4194304,  # 4 MB
                "uploaded_by": "operations.manager",
                "approved_by": None,
                "version": "3.0",
                "page_count": 89,
                "approval_required": True,
                "deadline": now + timedelta(days=14),
                "created_at": now - timedelta(days=1)
            },
            {
                "title": "Train Operator Certification Guidelines",
                "summary": "Updated certification requirements and training procedures for train operators including skill assessments and renewal criteria.",
                "content": "Revised certification framework for train operators covering theoretical knowledge, practical skills, safety protocols, and emergency procedures. Annual recertification required with biannual skill assessments.",
                "type": DocumentType.training,
                "department": "operations",
                "status": DocumentStatus.draft,
                "priority": DocumentPriority.medium,
                "file_name": "train-operator-certification-v2.pdf",
                "file_type": "pdf",
                "file_size": 2097152,  # 2 MB
                "uploaded_by": "operations.manager",
                "approved_by": None,
                "version": "2.0",
                "page_count": 34,
                "approval_required": True,
                "created_at": now - timedelta(hours=6)
            }
        ]
        
        documents = {}
        for doc_data in mock_documents:
            uploader = users[doc_data["uploaded_by"]]
            approver = users.get(doc_data["approved_by"]) if doc_data["approved_by"] else None
            
            document = Document(
                title=doc_data["title"],
                summary=doc_data["summary"],
                content=doc_data["content"],
                type=doc_data["type"],
                department=doc_data["department"],
                status=doc_data["status"],
                priority=doc_data["priority"],
                file_path=f"/uploads/{doc_data['file_name']}",
                file_name=doc_data["file_name"],
                file_type=doc_data["file_type"],
                file_size=doc_data["file_size"],
                uploaded_by=uploader.id,
                approved_by=approver.id if approver else None,
                version=doc_data["version"],
                page_count=doc_data["page_count"],
                approval_required=doc_data["approval_required"],
                deadline=doc_data.get("deadline"),
                view_count=random.randint(10, 100),
                download_count=random.randint(5, 50),
                bookmarked_by=json.dumps([]),
                created_at=doc_data["created_at"],
                approved_at=doc_data.get("approved_at")
            )
            
            db.add(document)
            documents[doc_data["title"]] = document
        
        db.commit()
        print(f"Created {len(mock_documents)} documents")
        
        # 3. Create Comments
        print("3. Creating comments...")
        mock_comments = [
            {
                "document": "Safety Protocol Update - Line 1 Operations",
                "author": "maintenance.engineer",
                "content": "Please coordinate with engineering team before implementing these changes. Some procedures may conflict with ongoing maintenance schedules.",
                "created_at": now - timedelta(days=2, hours=3)
            },
            {
                "document": "Maintenance Schedule Q4 2024",
                "author": "operations.manager",
                "content": "Excellent planning. Please ensure minimal service disruption during peak hours.",
                "created_at": now - timedelta(days=8)
            },
            {
                "document": "New Regulation Compliance - Ministry Guidelines",
                "author": "executive.user",
                "content": "This requires immediate attention. Please prepare implementation timeline and budget estimates.",
                "created_at": now - timedelta(days=2)
            },
            {
                "document": "Emergency Response Plan - Station Evacuation",
                "author": "safety.officer",
                "content": "Section 4.2 needs revision. Current evacuation routes don't account for ongoing construction at Platform 3.",
                "created_at": now - timedelta(hours=12),
                "page_number": 15,
                "position_x": 250,
                "position_y": 400
            }
        ]
        
        for comment_data in mock_comments:
            document = documents[comment_data["document"]]
            author = users[comment_data["author"]]
            
            comment = Comment(
                content=comment_data["content"],
                page_number=comment_data.get("page_number"),
                position_x=comment_data.get("position_x"),
                position_y=comment_data.get("position_y"),
                document_id=document.id,
                author_id=author.id,
                is_resolved=False,
                is_internal=True,
                created_at=comment_data["created_at"]
            )
            
            db.add(comment)
        
        db.commit()
        print(f"Created {len(mock_comments)} comments")
        
        # 4. Create Workflow History
        print("4. Creating workflow history...")
        workflow_entries = [
            {
                "document": "Safety Protocol Update - Line 1 Operations",
                "user": "safety.officer",
                "action": "uploaded",
                "comments": "Initial document upload",
                "previous_status": None,
                "new_status": "pending",
                "timestamp": now - timedelta(days=5)
            },
            {
                "document": "Safety Protocol Update - Line 1 Operations",
                "user": "executive.user",
                "action": "approved",
                "comments": "Approved after review. Excellent work on safety improvements.",
                "previous_status": "pending",
                "new_status": "approved",
                "timestamp": now - timedelta(days=2)
            },
            {
                "document": "New Regulation Compliance - Ministry Guidelines",
                "user": "compliance.officer",
                "action": "uploaded",
                "comments": "Urgent compliance requirements from ministry",
                "previous_status": None,
                "new_status": "pending",
                "timestamp": now - timedelta(days=3)
            }
        ]
        
        for entry in workflow_entries:
            document = documents[entry["document"]]
            user = users[entry["user"]]
            
            workflow = WorkflowHistory(
                document_id=document.id,
                user_id=user.id,
                action=entry["action"],
                comments=entry["comments"],
                previous_status=entry["previous_status"],
                new_status=entry["new_status"],
                timestamp=entry["timestamp"]
            )
            
            db.add(workflow)
        
        db.commit()
        print(f"Created {len(workflow_entries)} workflow history entries")
        
        # 5. Create Notifications
        print("5. Creating notifications...")
        notifications = [
            {
                "user": "executive.user",
                "type": NotificationType.approval_request,
                "title": "Document Approval Required",
                "message": "New Regulation Compliance - Ministry Guidelines requires your approval",
                "priority": NotificationPriority.high,
                "document_id": documents["New Regulation Compliance - Ministry Guidelines"].id,
                "is_read": False,
                "created_at": now - timedelta(days=3)
            },
            {
                "user": "operations.manager",
                "type": NotificationType.deadline_reminder,
                "title": "Deadline Approaching",
                "message": "Emergency Response Plan review deadline in 14 days",
                "priority": NotificationPriority.medium,
                "document_id": documents["Emergency Response Plan - Station Evacuation"].id,
                "is_read": False,
                "created_at": now - timedelta(hours=2)
            },
            {
                "user": "maintenance.engineer",
                "type": NotificationType.comment,
                "title": "New Comment",
                "message": "Operations Manager commented on Maintenance Schedule Q4 2024",
                "priority": NotificationPriority.low,
                "document_id": documents["Maintenance Schedule Q4 2024"].id,
                "is_read": True,
                "created_at": now - timedelta(days=8)
            },
            {
                "user": "safety.officer",
                "type": NotificationType.document_action,
                "title": "Document Approved",
                "message": "Safety Protocol Update - Line 1 Operations has been approved",
                "priority": NotificationPriority.medium,
                "document_id": documents["Safety Protocol Update - Line 1 Operations"].id,
                "is_read": False,
                "created_at": now - timedelta(days=2)
            }
        ]
        
        for notif_data in notifications:
            user = users[notif_data["user"]]
            
            notification = Notification(
                user_id=user.id,
                type=notif_data["type"],
                title=notif_data["title"],
                message=notif_data["message"],
                priority=notif_data["priority"],
                document_id=notif_data["document_id"],
                is_read=notif_data["is_read"],
                created_at=notif_data["created_at"]
            )
            
            db.add(notification)
        
        db.commit()
        print(f"Created {len(notifications)} notifications")
        
        print("\n✅ Mock data creation completed successfully!")
        print("\n📋 Summary:")
        print(f"   - {len(demo_users)} Users created")
        print(f"   - {len(mock_documents)} Documents created")
        print(f"   - {len(mock_comments)} Comments created")
        print(f"   - {len(workflow_entries)} Workflow history entries created")
        print(f"   - {len(notifications)} Notifications created")
        
        print("\n🔑 Login credentials:")
        print("   Username: executive.user | Password: demo123")
        print("   Username: maintenance.engineer | Password: demo123")
        print("   Username: compliance.officer | Password: demo123")
        print("   Username: finance.manager | Password: demo123")
        print("   Username: operations.manager | Password: demo123")
        print("   Username: safety.officer | Password: demo123")
        print("   Username: admin.user | Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating mock data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data()