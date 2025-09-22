# KMRL Document Management System - API Routes Specification

## Overview
This document outlines all API routes required for the KMRL Document Management System, categorized into Data Routes (traditional CRUD operations) and AI Routes (intelligent features and automation).

---

## 🗃️ DATA ROUTES

### 1. Authentication & Authorization

#### POST `/api/auth/login`
- **Purpose**: User authentication
- **Body**: `{ username, password }`
- **Response**: `{ token, user: { id, username, email, role, department, permissions } }`

#### POST `/api/auth/logout`
- **Purpose**: User logout
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Logout successful" }`

#### GET `/api/auth/me`
- **Purpose**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ user: { id, username, email, role, department, permissions } }`

#### PUT `/api/auth/profile`
- **Purpose**: Update user profile
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ email, language_preference, notification_settings }`
- **Response**: `{ user: { updated_user_data } }`

### 2. Document Management (CRUD)

#### GET `/api/documents`
- **Purpose**: List/filter documents
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: 
  ```
  ?type=safety|maintenance|compliance|finance|operations
  &department=operations|engineering|legal|finance
  &status=draft|pending|approved|rejected
  &priority=low|medium|high|urgent
  &page=1&limit=20
  &search=query_string
  &uploaded_by=user_id
  &date_from=YYYY-MM-DD
  &date_to=YYYY-MM-DD
  ```
- **Response**: 
  ```json
  {
    "documents": [],
    "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 },
    "filters_applied": {}
  }
  ```

#### GET `/api/documents/:id`
- **Purpose**: Get single document details
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "document": {
      "id": "doc-123",
      "title": "Safety Protocol v2.1",
      "type": "safety",
      "department": "operations",
      "status": "pending",
      "priority": "high",
      "file_path": "/documents/safety-protocol.pdf",
      "file_type": "pdf",
      "file_size": "2.4 MB",
      "created_at": "2024-12-12T10:30:00Z",
      "uploaded_by": "user-123",
      "summary": "Document summary",
      "metadata": {},
      "comments": [],
      "version_history": [],
      "approval_workflow": []
    }
  }
  ```

#### POST `/api/documents`
- **Purpose**: Upload new document
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: Form data with file and metadata
- **Response**: `{ document: { id, title, status, file_path } }`

#### PUT `/api/documents/:id`
- **Purpose**: Update document metadata
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, type, department, priority, summary }`
- **Response**: `{ document: { updated_document_data } }`

#### DELETE `/api/documents/:id`
- **Purpose**: Delete document (soft delete)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Document deleted successfully" }`

#### GET `/api/documents/:id/download`
- **Purpose**: Download document file
- **Headers**: `Authorization: Bearer <token>`
- **Response**: File stream

#### GET `/api/documents/:id/preview`
- **Purpose**: Get document preview/thumbnail
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Image/PDF preview

### 3. Document Workflow & Approval

#### POST `/api/documents/:id/approve`
- **Purpose**: Approve document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ comments?: string, conditions?: string[] }`
- **Response**: `{ document: { updated_status }, approval: { id, approved_by, timestamp } }`

#### POST `/api/documents/:id/reject`
- **Purpose**: Reject document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ reason: string, feedback: string }`
- **Response**: `{ document: { updated_status }, rejection: { id, rejected_by, reason, timestamp } }`

#### GET `/api/documents/:id/workflow`
- **Purpose**: Get approval workflow history
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ workflow: [{ action, user, timestamp, comments }] }`

#### POST `/api/documents/:id/request-revision`
- **Purpose**: Request document revision
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ requested_changes: string[], deadline?: date }`
- **Response**: `{ revision_request: { id, changes, deadline } }`

### 4. Comments & Annotations

#### GET `/api/documents/:id/comments`
- **Purpose**: Get document comments
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ comments: [{ id, user, content, timestamp, replies }] }`

#### POST `/api/documents/:id/comments`
- **Purpose**: Add comment to document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ content: string, page?: number, position?: { x, y } }`
- **Response**: `{ comment: { id, user, content, timestamp } }`

#### PUT `/api/comments/:id`
- **Purpose**: Update comment
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ content: string }`
- **Response**: `{ comment: { updated_comment_data } }`

#### DELETE `/api/comments/:id`
- **Purpose**: Delete comment
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Comment deleted" }`

### 5. Notifications

#### GET `/api/notifications`
- **Purpose**: Get user notifications
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?type=all|document_action|system|comment&unread_only=true&page=1&limit=20`
- **Response**: 
  ```json
  {
    "notifications": [],
    "unread_count": 5,
    "total": 25
  }
  ```

#### PUT `/api/notifications/:id/read`
- **Purpose**: Mark notification as read
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ notification: { id, read: true } }`

#### PUT `/api/notifications/read-all`
- **Purpose**: Mark all notifications as read
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ updated_count: 10 }`

#### DELETE `/api/notifications/:id`
- **Purpose**: Delete notification
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Notification deleted" }`

#### PUT `/api/notifications/settings`
- **Purpose**: Update notification preferences
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "email": { "document_approval": true, "deadline_reminders": true },
    "push": { "document_approval": false, "system_updates": true },
    "frequency": "immediate"
  }
  ```
- **Response**: `{ settings: { updated_settings } }`

### 6. User Management (Admin)

#### GET `/api/users`
- **Purpose**: List all users (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?role=admin|user|approver&department=operations&page=1&limit=20`
- **Response**: `{ users: [], pagination: {} }`

#### POST `/api/users`
- **Purpose**: Create new user (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ username, email, role, department, permissions }`
- **Response**: `{ user: { id, username, email, role } }`

#### PUT `/api/users/:id`
- **Purpose**: Update user (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ email, role, department, permissions, active }`
- **Response**: `{ user: { updated_user_data } }`

#### DELETE `/api/users/:id`
- **Purpose**: Deactivate user (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "User deactivated" }`

### 7. Dashboard & Analytics

#### GET `/api/dashboard/overview`
- **Purpose**: Get dashboard overview data
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "stats": {
      "total_documents": 1247,
      "pending_approvals": 23,
      "recent_uploads": 15,
      "compliance_rate": 94.5
    },
    "recent_documents": [],
    "pending_actions": [],
    "alerts": []
  }
  ```

#### GET `/api/dashboard/analytics`
- **Purpose**: Get detailed analytics
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?period=week|month|quarter|year&department=operations`
- **Response**: 
  ```json
  {
    "document_trends": [],
    "approval_metrics": {},
    "department_stats": {},
    "compliance_tracking": {}
  }
  ```

---

## 🤖 AI ROUTES

### 1. Intelligent Document Processing

#### POST `/api/ai/documents/extract`
- **Purpose**: Extract metadata and content from uploaded document using OCR/NLP
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: Form data with document file
- **Response**: 
  ```json
  {
    "extracted_data": {
      "title": "Extracted document title",
      "type": "safety",
      "department": "operations",
      "key_points": ["point1", "point2"],
      "compliance_items": [],
      "confidence": 0.95
    },
    "text_content": "Full extracted text...",
    "metadata": { "pages": 5, "language": "en" }
  }
  ```

#### POST `/api/ai/documents/summarize`
- **Purpose**: Generate AI summary of document content
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123" }` or `{ text_content: "raw text..." }`
- **Response**: 
  ```json
  {
    "summary": "AI-generated summary...",
    "key_points": ["Important point 1", "Important point 2"],
    "action_items": ["Action required 1"],
    "confidence": 0.92
  }
  ```

#### POST `/api/ai/documents/classify`
- **Purpose**: Automatically classify document type and department
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123" }` or `{ text_content: "..." }`
- **Response**: 
  ```json
  {
    "classification": {
      "type": "safety",
      "department": "operations",
      "priority": "high",
      "confidence": 0.89
    },
    "suggested_tags": ["emergency", "protocol", "line-1"],
    "compliance_category": "operational_safety"
  }
  ```

### 2. Intelligent Search & Discovery

#### POST `/api/ai/search/semantic`
- **Purpose**: Semantic search across documents using natural language
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "query": "safety protocols for emergency evacuation",
    "filters": { "department": "operations", "type": "safety" },
    "limit": 10
  }
  ```
- **Response**: 
  ```json
  {
    "results": [
      {
        "document": { "id": "doc-123", "title": "...", "relevance_score": 0.95 },
        "matching_content": "highlighted relevant text...",
        "explanation": "This document matches because..."
      }
    ],
    "query_intent": "user_seeking_safety_procedures",
    "suggested_refinements": ["evacuation procedures", "emergency protocols"]
  }
  ```

#### POST `/api/ai/search/similar`
- **Purpose**: Find documents similar to a given document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123", limit: 5 }`
- **Response**: 
  ```json
  {
    "similar_documents": [
      {
        "document": { "id": "doc-456", "title": "...", "similarity_score": 0.87 },
        "similarity_reasons": ["common_topic", "same_department", "related_keywords"]
      }
    ]
  }
  ```

#### GET `/api/ai/search/suggestions`
- **Purpose**: Get AI-powered search suggestions
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?q=partial_query&context=safety`
- **Response**: 
  ```json
  {
    "suggestions": [
      { "text": "safety protocols", "type": "completion", "confidence": 0.9 },
      { "text": "emergency procedures", "type": "related", "confidence": 0.8 }
    ]
  }
  ```

### 3. Compliance & Risk Assessment

#### POST `/api/ai/compliance/check`
- **Purpose**: AI-powered compliance checking for documents
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123" }` or `{ text_content: "..." }`
- **Response**: 
  ```json
  {
    "compliance_status": "partial_compliance",
    "compliance_score": 0.78,
    "issues": [
      {
        "type": "missing_section",
        "description": "Document lacks required safety checklist",
        "severity": "high",
        "suggestion": "Add safety checklist section"
      }
    ],
    "requirements_met": ["req1", "req2"],
    "requirements_missing": ["req3"]
  }
  ```

#### POST `/api/ai/risk/assess`
- **Purpose**: AI risk assessment for document content
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123", context: "operational_safety" }`
- **Response**: 
  ```json
  {
    "risk_level": "medium",
    "risk_score": 0.65,
    "risk_factors": [
      {
        "factor": "outdated_procedure",
        "impact": "high",
        "likelihood": "medium",
        "mitigation": "Update procedure with latest standards"
      }
    ],
    "recommendations": ["Immediate review required", "Schedule training"]
  }
  ```

### 4. Intelligent Recommendations

#### GET `/api/ai/recommendations/documents`
- **Purpose**: Get personalized document recommendations for user
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?context=current_role&limit=5`
- **Response**: 
  ```json
  {
    "recommendations": [
      {
        "document": { "id": "doc-789", "title": "...", "relevance_score": 0.91 },
        "reason": "relevant_to_your_department",
        "action": "review_required"
      }
    ],
    "trending_documents": [],
    "urgent_reviews": []
  }
  ```

#### GET `/api/ai/recommendations/actions`
- **Purpose**: Get AI-recommended actions for user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "recommended_actions": [
      {
        "type": "document_review",
        "document_id": "doc-123",
        "priority": "high",
        "reason": "pending_approval_overdue",
        "estimated_time": "15 minutes"
      }
    ]
  }
  ```

### 5. Workflow Automation & Intelligence

#### POST `/api/ai/workflow/suggest`
- **Purpose**: Get AI suggestions for document workflow routing
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123" }`
- **Response**: 
  ```json
  {
    "suggested_workflow": [
      { "step": 1, "role": "safety_officer", "action": "initial_review" },
      { "step": 2, "role": "department_head", "action": "approval" }
    ],
    "estimated_duration": "3 days",
    "confidence": 0.88
  }
  ```

#### POST `/api/ai/workflow/auto-route`
- **Purpose**: Automatically route document based on AI analysis
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123", auto_apply: true }`
- **Response**: 
  ```json
  {
    "routing_applied": true,
    "assigned_reviewers": ["user-456", "user-789"],
    "workflow_id": "wf-123",
    "reasoning": "Document classified as safety-critical requiring dual approval"
  }
  ```

### 6. Content Generation & Enhancement

#### POST `/api/ai/generate/summary`
- **Purpose**: Generate executive summary for document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123", length: "short|medium|detailed" }`
- **Response**: 
  ```json
  {
    "generated_summary": "AI-generated executive summary...",
    "key_highlights": ["point1", "point2"],
    "recommendations": ["action1", "action2"]
  }
  ```

#### POST `/api/ai/generate/checklist`
- **Purpose**: Generate compliance checklist from document
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ document_id: "doc-123", checklist_type: "safety|compliance|maintenance" }`
- **Response**: 
  ```json
  {
    "checklist": [
      { "item": "Verify safety equipment", "required": true, "category": "safety" },
      { "item": "Document training completion", "required": true, "category": "compliance" }
    ],
    "checklist_id": "cl-123"
  }
  ```

### 7. Analytics & Insights

#### GET `/api/ai/analytics/trends`
- **Purpose**: AI-powered trend analysis of documents and processes
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?period=month&department=operations&metric=compliance`
- **Response**: 
  ```json
  {
    "trends": {
      "document_volume": { "trend": "increasing", "percentage": 15.3 },
      "compliance_rate": { "trend": "stable", "percentage": 2.1 },
      "approval_time": { "trend": "decreasing", "percentage": -8.7 }
    },
    "insights": [
      "Safety document submissions increased 20% this month",
      "Average approval time reduced by 2 days"
    ],
    "predictions": {
      "next_month_volume": 145,
      "potential_bottlenecks": ["approval_queue_safety"]
    }
  }
  ```

#### GET `/api/ai/analytics/anomalies`
- **Purpose**: Detect anomalies in document patterns
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "anomalies": [
      {
        "type": "unusual_pattern",
        "description": "Spike in safety document rejections",
        "severity": "medium",
        "affected_period": "last_week",
        "investigation_needed": true
      }
    ]
  }
  ```

---

## 🔗 WebSocket Endpoints (Real-time)

### `/ws/notifications`
- **Purpose**: Real-time notifications
- **Authentication**: Token-based
- **Events**: `new_notification`, `notification_read`, `notification_deleted`

### `/ws/documents/:id`
- **Purpose**: Real-time document collaboration
- **Authentication**: Token-based
- **Events**: `comment_added`, `status_changed`, `user_viewing`

### `/ws/dashboard`
- **Purpose**: Real-time dashboard updates
- **Authentication**: Token-based
- **Events**: `stats_updated`, `new_alert`, `trend_change`

---

## 🔧 Implementation Notes

### Authentication
- All routes require JWT token in Authorization header except login
- Role-based access control implemented at route level
- Rate limiting applied to AI routes to prevent abuse

### Error Handling
- Consistent error response format:
  ```json
  {
    "error": {
      "code": "DOCUMENT_NOT_FOUND",
      "message": "Document not found",
      "details": "Document with ID doc-123 does not exist"
    }
  }
  ```

### Pagination
- Standard pagination format for list endpoints
- Default limit: 20, max limit: 100

### File Handling
- Support for PDF, DOC, DOCX, TXT, images
- Maximum file size: 50MB
- Virus scanning on upload
- Secure file storage with access control

### AI Services Integration
- External AI services for NLP, OCR, classification
- Fallback mechanisms for AI service failures
- Confidence scores provided for all AI predictions
- Human review option for low-confidence AI results

This specification provides a comprehensive foundation for implementing both traditional CRUD operations and advanced AI-powered features for the KMRL document management system.