# KMRL Document Management System

A full-stack document management platform for Kochi Metro Rail Limited (KMRL), built with React (frontend) and FastAPI (backend). The system supports document upload, approval workflows, notifications, user management, and analytics.

## Features
- User authentication (JWT-based)
- Document upload, view, search, and download
- Approval and revision workflows
- Notifications for document actions
- Role-based access and permissions
- Dashboard analytics
- Admin user management

## Tech Stack
- **Frontend:** React, Redux Toolkit, Material-UI
- **Backend:** FastAPI, SQLAlchemy, SQLite
- **API:** RESTful, JWT Auth

---

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- Python 3.10+
- (Optional) Virtualenv for Python

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate venv:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# (Optional) Populate database with mock data
python create_mock_data.py

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000/api/v1`.

### 2. Frontend Setup

```bash
cd kmrl-document-system
npm install

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`.

---

## Environment Variables

- **Frontend:**
  - Create a `.env` file in `kmrl-document-system/` (optional):
    ```env
    REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
    ```
- **Backend:**
  - Configure environment variables in `backend/app/core/config.py` as needed.

---

## Usage
- Login with demo users (see `create_mock_data.py` for credentials)
- Upload, view, and manage documents
- Approve/reject documents (if you have the right role)
- View notifications and dashboard analytics

---

## Project Structure

```
backend/
  app/
    api/         # FastAPI endpoints
    core/        # Config, DB, security
    models/      # SQLAlchemy models
    schemas/     # Pydantic schemas
    ...
  main.py       # FastAPI app entrypoint
  requirements.txt

kmrl-document-system/
  src/
    components/  # React components
    pages/       # Main pages
    services/    # API services
    store/       # Redux slices
    ...
  package.json
```

---

## License
This project is for internal use at KMRL. Contact the maintainers for more information.
