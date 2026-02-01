# Role-Based Backend Architecture

## Quick Start

### 1. Run Database Migration

```bash
npm run migrate
```

This will:
- Update User role enum to include 'admin', 'reception', 'teacher', 'parent'
- Add verification fields to User table
- Create all new tables (Document, ParentActivity, ParentMeal, ParentMedia, TeacherResponsibility, TeacherTask, TeacherWorkHistory)

### 2. Create Initial Admin Account

You'll need to create an Admin account manually or via script. The Admin account is the only account that doesn't require approval.

### 3. Start the Server

```bash
npm run dev
```

## Role Workflow

### Reception Account Setup Flow

1. **Create Reception Account** (via script or database)
   - Role: 'reception'
   - `isActive`: false
   - `documentsApproved`: false

2. **Reception Uploads Documents**
   - POST `/api/reception/documents`
   - Documents are stored with status: 'pending'

3. **Admin Reviews Documents**
   - GET `/api/admin/documents/pending` - View pending documents
   - PUT `/api/admin/documents/:id/approve` - Approve document
   - PUT `/api/admin/documents/:id/reject` - Reject document

4. **Account Activation**
   - When all documents are approved, Reception account is automatically activated
   - `documentsApproved`: true
   - `isActive`: true
   - Reception can now log in

### Reception Creates Teacher/Parent Accounts

1. **Create Teacher**
   - POST `/api/reception/teachers`
   - Provides email and password
   - Account is immediately active

2. **Create Parent**
   - POST `/api/reception/parents`
   - Provides email and password
   - Account is immediately active

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login (all roles, Reception must be approved)
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Admin Endpoints
- `GET /api/admin/receptions` - List all Reception accounts
- `GET /api/admin/receptions/:id` - Get Reception details
- `GET /api/admin/documents/pending` - Get pending documents
- `PUT /api/admin/documents/:id/approve` - Approve document
- `PUT /api/admin/documents/:id/reject` - Reject document
- `PUT /api/admin/receptions/:id/activate` - Manually activate Reception

### Reception Endpoints
- `POST /api/reception/documents` - Upload document
- `GET /api/reception/documents` - Get own documents
- `GET /api/reception/verification-status` - Check verification status
- `POST /api/reception/teachers` - Create Teacher
- `GET /api/reception/teachers` - List Teachers
- `POST /api/reception/parents` - Create Parent
- `GET /api/reception/parents` - List Parents

### Parent Endpoints
- `GET /api/parent/activities` - Get own activities
- `GET /api/parent/meals` - Get own meals
- `GET /api/parent/media` - Get own media
- `GET /api/parent/profile` - Get profile summary

### Teacher Endpoints
- `GET /api/teacher/profile` - Get full profile
- `GET /api/teacher/dashboard` - Get dashboard summary
- `GET /api/teacher/responsibilities` - Get responsibilities
- `GET /api/teacher/tasks` - Get tasks
- `GET /api/teacher/work-history` - Get work history

## Key Features

### ✅ Implemented

1. **Role Renaming**
   - Super Admin → Admin
   - Admin → Reception

2. **Removed Modules**
   - Children module removed
   - Schedule module removed
   - News module removed
   - Global Activities, Meals, Media removed

3. **Reception Verification**
   - Document upload system
   - Admin approval workflow
   - Login restriction until approved

4. **Parent-Specific Data**
   - Activities linked to parent
   - Meals linked to parent
   - Media linked to parent
   - Parents only see their own data

5. **Teacher Profile**
   - Responsibilities display
   - Tasks display
   - Work history with deadlines

6. **Access Control**
   - Teachers cannot create/manage parents
   - Reception cannot access removed modules
   - Role-based route protection

## Database Schema Changes

### New Tables
- `documents` - Reception document uploads
- `parent_activities` - Parent-specific activities
- `parent_meals` - Parent-specific meals
- `parent_media` - Parent-specific media
- `teacher_responsibilities` - Teacher responsibilities
- `teacher_tasks` - Teacher tasks
- `teacher_work_history` - Teacher work history and deadlines

### Updated Tables
- `users` - Added `isVerified`, `documentsApproved`, `isActive` fields
- `users` - Updated role enum to include 'reception'

## Testing the System

### 1. Test Reception Verification Flow

```bash
# 1. Create Reception account (via script or database)
# 2. Reception uploads document
curl -X POST http://localhost:5000/api/reception/documents \
  -H "Authorization: Bearer <reception_token>" \
  -F "file=@document.pdf" \
  -F "documentType=license"

# 3. Admin views pending documents
curl -X GET http://localhost:5000/api/admin/documents/pending \
  -H "Authorization: Bearer <admin_token>"

# 4. Admin approves document
curl -X PUT http://localhost:5000/api/admin/documents/:id/approve \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Test Parent Data Access

```bash
# Parent views own activities
curl -X GET http://localhost:5000/api/parent/activities \
  -H "Authorization: Bearer <parent_token>"

# Admin views parent data
curl -X GET http://localhost:5000/api/parent/:id/data \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Test Teacher Profile

```bash
# Teacher views profile
curl -X GET http://localhost:5000/api/teacher/profile \
  -H "Authorization: Bearer <teacher_token>"
```

## Important Notes

1. **Reception Login Restriction**: Reception accounts cannot log in until:
   - Documents are uploaded (`isVerified = true`)
   - All documents are approved (`documentsApproved = true`)
   - Account is active (`isActive = true`)

2. **Parent Data Isolation**: Parents can only access their own data. When Admin/Reception views a parent's data, it shows activities, meals, and media for that specific parent.

3. **Teacher Restrictions**: Teachers cannot create or manage parent accounts. Only Reception can create parent accounts.

4. **Removed Modules**: The following modules are completely removed:
   - Children
   - Schedule
   - News
   - Global Activities
   - Global Meals
   - Global Media

## Environment Variables

Make sure your `.env` file includes:

```env
PORT=5000
NODE_ENV=development

DB_NAME=uchqun
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

## Support

For issues or questions, refer to:
- `ARCHITECTURE.md` - Detailed architecture documentation
- `README.md` - General backend documentation
- Migration file comments - Database schema details



