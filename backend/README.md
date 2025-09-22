# KMRL Document Management System - FastAPI Backend

A comprehensive document management system backend built with FastAPI for Kochi Metro Rail Limited (KMRL).

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Document Management**: Complete CRUD operations for documents with file upload
- **Workflow Management**: Document approval/rejection workflows with history tracking
- **Notifications**: Real-time notification system for users
- **Dashboard & Analytics**: Comprehensive dashboard with analytics and insights
- **User Management**: Admin panel for user management
- **Security**: Secure file handling, input validation, and proper authentication

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication
- **Uvicorn**: ASGI server

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py          # Authentication endpoints
│   │       │   ├── documents.py     # Document management
│   │       │   ├── users.py         # User management
│   │       │   ├── notifications.py # Notification system
│   │       │   └── dashboard.py     # Dashboard & analytics
│   │       └── api.py              # API router
│   ├── core/
│   │   ├── config.py               # Configuration settings
│   │   ├── database.py             # Database connection
│   │   └── security.py             # Security utilities
│   ├── models/
│   │   ├── user.py                 # User model
│   │   ├── document.py             # Document models
│   │   ├── comment.py              # Comment model
│   │   └── notification.py         # Notification model
│   ├── schemas/
│   │   ├── user.py                 # User schemas
│   │   ├── document.py             # Document schemas
│   │   ├── notification.py         # Notification schemas
│   │   └── dashboard.py            # Dashboard schemas
│   └── deps.py                     # Dependencies
├── uploads/                        # File upload directory
├── main.py                         # Application entry point
├── requirements.txt                # Python dependencies
└── .env.template                   # Environment template
```

## Installation

1. **Clone the repository**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

5. **Set up PostgreSQL database**:
   ```sql
   CREATE DATABASE kmrl_documents;
   CREATE USER kmrl_user WITH PASSWORD 'kmrl_password';
   GRANT ALL PRIVILEGES ON DATABASE kmrl_documents TO kmrl_user;
   ```

6. **Run the application**:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Environment Variables

Key environment variables (see `.env.template` for complete list):

- `SECRET_KEY`: JWT secret key
- `POSTGRES_SERVER`: Database server host
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `REDIS_URL`: Redis connection URL
- `BACKEND_CORS_ORIGINS`: Allowed CORS origins

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile

### Documents
- `GET /api/v1/documents/` - List documents with filters
- `POST /api/v1/documents/` - Upload new document
- `GET /api/v1/documents/{id}` - Get document details
- `PUT /api/v1/documents/{id}` - Update document
- `DELETE /api/v1/documents/{id}` - Delete document
- `POST /api/v1/documents/{id}/approve` - Approve/reject document
- `GET /api/v1/documents/{id}/workflow` - Get workflow history
- `GET /api/v1/documents/{id}/download` - Download document

### Users (Admin only)
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Deactivate user

### Notifications
- `GET /api/v1/notifications/` - Get user notifications
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification
- `GET /api/v1/notifications/settings` - Get notification settings
- `PUT /api/v1/notifications/settings` - Update settings

### Dashboard
- `GET /api/v1/dashboard/overview` - Dashboard overview
- `GET /api/v1/dashboard/analytics` - Analytics data

## User Roles

- **Admin**: Full system access
- **Executive**: Management-level access, can approve all documents
- **Maintenance**: Engineering department access
- **Compliance**: Legal & compliance access
- **Finance**: Finance department access
- **User**: Basic user access

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM
- File upload validation
- CORS protection

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Testing

Run tests with:
```bash
pytest
```

## License

This project is licensed under the MIT License.