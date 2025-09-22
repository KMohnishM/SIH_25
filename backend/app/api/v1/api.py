"""
Main API router that includes all endpoint routers
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, documents, users, notifications, dashboard, comments

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(comments.router, prefix="/documents", tags=["comments"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])