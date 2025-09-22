# KMRL Document Management System - Backend API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All API endpoints (except auth endpoints) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
**Description:** User login with credentials

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "executive|maintenance|compliance|sustainability|it_admin",
      "department": "string",
      "permissions": ["read_documents", "upload_documents", "approve_documents"],
      "language_preference": "en|ml"
    }
  }
}
```

### POST `/auth/logout`
**Description:** Logout user and invalidate token

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/auth/me`
**Description:** Get current user profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "department": "string",
    "permissions": ["string"],
    "language_preference": "en|ml"
  }
}
```

---

## 📄 Document Management Endpoints

### GET `/documents`
**Description:** Get paginated list of documents with filters

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
type: "maintenance|incident|invoice|policy|regulatory|safety|hr|legal|board_minutes"
department: "engineering|hr|finance|operations|procurement"
language: "en|ml|mixed"
status: "pending|approved|archived"
priority: "low|medium|high|urgent"
date_from: "YYYY-MM-DD"
date_to: "YYYY-MM-DD"
search: "search_query"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "title": "string",
        "type": "maintenance",
        "department": "engineering",
        "source": "email|sharepoint|whatsapp|upload|maximo",
        "language": "en|ml|mixed",
        "status": "pending",
        "priority": "high",
        "file_path": "string",
        "file_size": "number",
        "created_at": "ISO_datetime",
        "uploaded_by": "user_id",
        "summary": {
          "ai_summary": "string",
          "key_points": ["string"],
          "action_items": ["string"],
          "deadlines": ["ISO_datetime"],
          "entities": {
            "people": ["string"],
            "amounts": ["string"],
            "dates": ["string"],
            "equipment_ids": ["string"]
          }
        },
        "compliance_info": {
          "requires_approval": true,
          "approval_deadline": "ISO_datetime",
          "regulatory_category": "safety|environmental|financial"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### GET `/documents/{document_id}`
**Description:** Get detailed document information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "type": "maintenance",
    "content": {
      "raw_text": "string",
      "ocr_text": "string",
      "translated_text": "string"
    },
    "summary": {
      "ai_summary": "string",
      "key_points": ["string"],
      "action_items": ["string"],
      "deadlines": ["ISO_datetime"],
      "entities": {
        "people": ["string"],
        "amounts": ["string"],
        "dates": ["string"],
        "equipment_ids": ["string"]
      }
    },
    "metadata": {
      "source": "email",
      "original_filename": "string",
      "file_size": "number",
      "pages": "number",
      "language": "en",
      "confidence_score": 0.95
    },
    "workflow": {
      "status": "pending",
      "assigned_to": ["user_id"],
      "approvals": [
        {
          "user_id": "uuid",
          "status": "approved|rejected|pending",
          "timestamp": "ISO_datetime",
          "comments": "string"
        }
      ],
      "routing_history": [
        {
          "from_department": "engineering",
          "to_department": "finance",
          "timestamp": "ISO_datetime",
          "reason": "requires_budget_approval"
        }
      ]
    },
    "related_documents": [
      {
        "id": "uuid",
        "title": "string",
        "relationship": "follow_up|references|supersedes"
      }
    ]
  }
}
```

### POST `/documents/upload`
**Description:** Upload new document(s)

**Request:** Multipart form data
```
files: File[] (multiple files allowed)
metadata: {
  "type": "maintenance",
  "department": "engineering",
  "priority": "high",
  "description": "string",
  "tags": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded_documents": [
      {
        "id": "uuid",
        "filename": "string",
        "status": "processing|completed|failed",
        "processing_job_id": "uuid"
      }
    ]
  }
}
```

### POST `/documents/{document_id}/approve`
**Description:** Approve/reject document

**Request Body:**
```json
{
  "action": "approve|reject",
  "comments": "string",
  "forward_to_department": "string" // optional
}
```

### GET `/documents/{document_id}/download`
**Description:** Download original document file

**Response:** File stream with appropriate headers

---

## 🔍 Search Endpoints

### GET `/search`
**Description:** Semantic search across documents

**Query Parameters:**
```
q: "search query"
type: "semantic|keyword|hybrid"
limit: number (default: 10)
filters: {
  "department": "string",
  "type": "string",
  "date_range": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "document_id": "uuid",
        "title": "string",
        "relevance_score": 0.95,
        "matched_snippets": [
          {
            "text": "string",
            "highlight_positions": [[0, 10], [15, 25]]
          }
        ],
        "summary": "string"
      }
    ],
    "search_metadata": {
      "query": "search query",
      "total_results": 25,
      "search_time_ms": 150,
      "suggestions": ["related query 1", "related query 2"]
    }
  }
}
```

### GET `/search/suggestions`
**Description:** Get search suggestions based on user role and history

**Query Parameters:**
```
q: "partial query"
role: "user_role"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "safety updates line 1",
        "type": "query",
        "frequency": 15
      },
      {
        "text": "maintenance schedule",
        "type": "document_type",
        "frequency": 8
      }
    ]
  }
}
```

---

## 📊 Dashboard Endpoints

### GET `/dashboard/overview`
**Description:** Get role-based dashboard data

**Query Parameters:**
```
role: "executive|maintenance|compliance|sustainability|it_admin"
date_range: "7d|30d|90d|1y"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_documents": 1250,
      "pending_approvals": 15,
      "urgent_items": 3,
      "compliance_deadline_approaching": 8
    },
    "recent_documents": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "priority": "string",
        "created_at": "ISO_datetime"
      }
    ],
    "alerts": [
      {
        "id": "uuid",
        "type": "compliance_deadline|urgent_approval|system_alert",
        "title": "string",
        "description": "string",
        "priority": "high",
        "created_at": "ISO_datetime",
        "action_required": true
      }
    ],
    "charts_data": {
      "document_volume_trend": [
        {"date": "2024-01-01", "count": 45}
      ],
      "department_distribution": [
        {"department": "engineering", "count": 120}
      ],
      "compliance_status": {
        "compliant": 85,
        "pending": 12,
        "overdue": 3
      }
    }
  }
}
```

### GET `/dashboard/analytics`
**Description:** Get analytics data for charts and insights

**Query Parameters:**
```
metric: "document_processing_time|user_activity|compliance_tracking|sustainability_impact"
date_range: "7d|30d|90d|1y"
granularity: "daily|weekly|monthly"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "date": "2024-01-01",
        "value": 25.5,
        "metadata": {
          "avg_processing_time": "2.3 minutes",
          "documents_processed": 45
        }
      }
    ],
    "insights": [
      {
        "title": "Processing Efficiency Improved",
        "description": "Document processing time reduced by 15% this month",
        "impact": "positive",
        "trend": "improving"
      }
    ]
  }
}
```

---

## 🔔 Notifications Endpoints

### GET `/notifications`
**Description:** Get user notifications

**Query Parameters:**
```
unread_only: boolean
limit: number
offset: number
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "document_approval|deadline_reminder|system_alert",
        "title": "string",
        "message": "string",
        "priority": "low|medium|high|urgent",
        "read": false,
        "created_at": "ISO_datetime",
        "action_url": "string",
        "metadata": {
          "document_id": "uuid",
          "department": "string"
        }
      }
    ],
    "unread_count": 5
  }
}
```

### POST `/notifications/{notification_id}/mark-read`
**Description:** Mark notification as read

### WebSocket `/ws/notifications`
**Description:** Real-time notification updates

**Message Format:**
```json
{
  "type": "new_notification|update|bulk_update",
  "data": {
    "notification": {
      "id": "uuid",
      "type": "document_approval",
      "title": "string",
      "message": "string",
      "priority": "high",
      "created_at": "ISO_datetime"
    }
  }
}
```

---

## 🏗️ System Administration Endpoints

### GET `/admin/system-health`
**Description:** Get system health metrics (IT Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "services": {
      "document_processor": "healthy",
      "ai_service": "healthy",
      "database": "healthy",
      "search_engine": "degraded"
    },
    "metrics": {
      "avg_processing_time": "2.1 seconds",
      "queue_size": 15,
      "error_rate": "0.2%",
      "uptime": "99.8%"
    }
  }
}
```

### GET `/admin/users`
**Description:** Get all users (Admin only)

### POST `/admin/users`
**Description:** Create new user

### PUT `/admin/users/{user_id}`
**Description:** Update user details

---

## 🌍 Sustainability Tracking Endpoints

### GET `/sustainability/impact`
**Description:** Get environmental impact metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "paper_saved": {
      "sheets": 15420,
      "weight_kg": 77.1,
      "trees_saved": 0.18
    },
    "energy_consumption": {
      "digital_storage_kwh": 45.2,
      "processing_kwh": 12.8,
      "carbon_footprint_kg": 28.5
    },
    "efficiency_gains": {
      "time_saved_hours": 1240,
      "cost_saved_inr": 156000,
      "document_automation_rate": "78%"
    }
  }
}
```

---

## 📈 Integration Endpoints

### POST `/integrations/maximo/sync`
**Description:** Trigger sync with Maximo system

### GET `/integrations/sharepoint/documents`
**Description:** List SharePoint documents

### POST `/integrations/iot/alerts`
**Description:** Receive IoT alerts and link to relevant documents

---

## Error Response Format

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": {
      "field": "specific field error"
    }
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error