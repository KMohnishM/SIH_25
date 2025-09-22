#!/usr/bin/env python3
"""
Script to create demo users for the KMRL Document Management System
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.models.user import User, UserRole, UserDepartment
from app.core.security import get_password_hash
import json

def create_demo_users():
    """Create demo users for testing"""
    
    # Create database session
    db = Session(engine)
    
    try:
        # Demo users data
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
                "username": "admin.user",
                "email": "admin@kmrl.co.in",
                "full_name": "System Administrator",
                "role": UserRole.admin,
                "department": UserDepartment.management,
                "permissions": ["read_documents", "upload_documents", "approve_documents", "manage_users", "view_analytics", "system_admin"],
                "password": "admin123"
            }
        ]
        
        created_users = []
        
        for user_data in demo_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
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
            created_users.append(user_data["username"])
        
        # Commit all users
        db.commit()
        
        print(f"Successfully created {len(created_users)} demo users:")
        for username in created_users:
            print(f"  - {username}")
        
        print("\nLogin credentials:")
        print("Username: executive.user | Password: demo123")
        print("Username: maintenance.engineer | Password: demo123")
        print("Username: compliance.officer | Password: demo123")
        print("Username: finance.manager | Password: demo123")
        print("Username: admin.user | Password: admin123")
        
    except Exception as e:
        print(f"Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating demo users for KMRL Document Management System...")
    create_demo_users()
    print("Demo user creation completed!")