# Backend Architecture Documentation

## Overview

This document describes the backend architecture for the Uchqun platform with role-based access control.

## Roles

### Role Hierarchy

1. **Admin** (formerly Super Admin)
   - Highest level of access
   - Controls verification of Reception accounts
   - Reviews and approves/rejects Reception documents
   - Activates Reception accounts after document approval

2. **Reception** (formerly Admin)
   - Manages Teacher and Parent accounts
   - Provides login credentials to Teachers and Parents
   - Uploads required documents for Admin review
   - Cannot access Activity, Meals, Media, News, or Children modules

3. **Teacher**
   - Views assigned responsibilities
   - Views tasks performed
   - Views deadlines and work history
   - Cannot create or manage parents

4. **Parent**
   - Views own activities, meals, and media
   - Only sees data related to their own account

## Database Schema

### Core Tables

#### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `phone` (String, Optional)
- `role` (ENUM: 'admin', 'reception', 'teacher', 'parent')
- `isVerified` (Boolean) - For Reception: indicates documents uploaded
- `documentsApproved` (Boolean) - For Reception: indicates Admin approval
- `isActive` (Boolean) - For Reception: indicates account can log in
- `avatar` (String, Optional)
- `notificationPreferences` (JSONB)
- `createdAt`, `updatedAt` (Timestamps)

#### Documents Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `documentType` (ENUM: 'license', 'certificate', 'identification', 'other')
- `fileName` (String)
- `filePath` (String)
- `fileSize` (Integer, Optional)
- `mimeType` (String, Optional)
- `status` (ENUM: 'pending', 'approved', 'rejected')
- `reviewedBy` (UUID, Foreign Key → users.id, Optional)
- `reviewedAt` (Date, Optional)
- `rejectionReason` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

#### Parent-Specific Tables

**ParentActivity**
- `id` (UUID, Primary Key)
- `parentId` (UUID, Foreign Key → users.id)
- `title` (String)
- `description` (Text, Optional)
- `activityDate` (Date)
- `activityType` (ENUM: 'educational', 'recreational', 'therapeutic', 'social', 'other')
- `location` (String, Optional)
- `notes` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**ParentMeal**
- `id` (UUID, Primary Key)
- `parentId` (UUID, Foreign Key → users.id)
- `mealDate` (Date)
- `mealType` (ENUM: 'breakfast', 'lunch', 'dinner', 'snack')
- `mealName` (String)
- `description` (Text, Optional)
- `calories` (Integer, Optional)
- `notes` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**ParentMedia**
- `id` (UUID, Primary Key)
- `parentId` (UUID, Foreign Key → users.id)
- `fileName` (String)
- `filePath` (String)
- `fileType` (ENUM: 'image', 'video', 'document', 'audio')
- `mimeType` (String, Optional)
- `fileSize` (Integer, Optional)
- `title` (String, Optional)
- `description` (Text, Optional)
- `uploadDate` (Date)
- `createdAt`, `updatedAt` (Timestamps)

#### Teacher-Specific Tables

**TeacherResponsibility**
- `id` (UUID, Primary Key)
- `teacherId` (UUID, Foreign Key → users.id)
- `title` (String)
- `description` (Text, Optional)
- `assignedDate` (Date)
- `status` (ENUM: 'active', 'completed', 'cancelled')
- `priority` (ENUM: 'low', 'medium', 'high', 'urgent')
- `createdAt`, `updatedAt` (Timestamps)

**TeacherTask**
- `id` (UUID, Primary Key)
- `teacherId` (UUID, Foreign Key → users.id)
- `title` (String)
- `description` (Text, Optional)
- `taskDate` (Date)
- `status` (ENUM: 'pending', 'in_progress', 'completed', 'cancelled')
- `completedAt` (Date, Optional)
- `notes` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**TeacherWorkHistory**
- `id` (UUID, Primary Key)
- `teacherId` (UUID, Foreign Key → users.id)
- `title` (String)
- `description` (Text, Optional)
- `workDate` (Date)
- `deadline` (Date, Optional)
- `status` (ENUM: 'pending', 'in_progress', 'completed', 'overdue', 'cancelled')
- `completedAt` (Date, Optional)
- `workType` (ENUM: 'assignment', 'report', 'meeting', 'training', 'evaluation', 'other')
- `notes` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

## API Routes

### Authentication Routes (`/api/auth`)
- `POST /api/auth/login` - Login (all roles)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)

### Admin Routes (`/api/admin`)
All routes require Admin authentication.

**Reception Management:**
- `GET /api/admin/receptions` - Get all Reception accounts
- `GET /api/admin/receptions/:id` - Get specific Reception account
- `PUT /api/admin/receptions/:id/activate` - Activate Reception account
- `PUT /api/admin/receptions/:id/deactivate` - Deactivate Reception account

**Document Management:**
- `GET /api/admin/documents/pending` - Get all pending documents
- `GET /api/admin/receptions/:id/documents` - Get documents for a Reception
- `PUT /api/admin/documents/:id/approve` - Approve a document
- `PUT /api/admin/documents/:id/reject` - Reject a document

### Reception Routes (`/api/reception`)
All routes require Reception authentication and approved documents.

**Document Management:**
- `POST /api/reception/documents` - Upload document for verification
- `GET /api/reception/documents` - Get own documents
- `GET /api/reception/verification-status` - Get verification status

**Teacher Management:**
- `POST /api/reception/teachers` - Create Teacher account
- `GET /api/reception/teachers` - Get all Teachers
- `PUT /api/reception/teachers/:id` - Update Teacher
- `DELETE /api/reception/teachers/:id` - Delete Teacher

**Parent Management:**
- `POST /api/reception/parents` - Create Parent account
- `GET /api/reception/parents` - Get all Parents
- `PUT /api/reception/parents/:id` - Update Parent
- `DELETE /api/reception/parents/:id` - Delete Parent

### Parent Routes (`/api/parent`)
All routes require Parent authentication.

**Own Data:**
- `GET /api/parent/activities` - Get own activities
- `GET /api/parent/activities/:id` - Get specific activity
- `GET /api/parent/meals` - Get own meals
- `GET /api/parent/meals/:id` - Get specific meal
- `GET /api/parent/media` - Get own media
- `GET /api/parent/media/:id` - Get specific media
- `GET /api/parent/profile` - Get profile with summary

**View Parent Data (Admin/Reception):**
- `GET /api/parent/:id/data` - Get parent data (activities, meals, media)

### Teacher Routes (`/api/teacher`)
All routes require Teacher authentication.

**Profile:**
- `GET /api/teacher/profile` - Get profile with all data
- `GET /api/teacher/dashboard` - Get dashboard summary

**Responsibilities:**
- `GET /api/teacher/responsibilities` - Get assigned responsibilities
- `GET /api/teacher/responsibilities/:id` - Get specific responsibility

**Tasks:**
- `GET /api/teacher/tasks` - Get tasks performed
- `GET /api/teacher/tasks/:id` - Get specific task
- `PUT /api/teacher/tasks/:id/status` - Update task status

**Work History:**
- `GET /api/teacher/work-history` - Get work history with deadlines
- `GET /api/teacher/work-history/:id` - Get specific work history item
- `PUT /api/teacher/work-history/:id/status` - Update work history status

## Business Logic

### Reception Account Verification Flow

1. **Installation**: After application installation, Reception must upload required documents
2. **Document Upload**: Reception uploads documents via `/api/reception/documents`
3. **Admin Review**: Admin views documents via `/api/admin/documents/pending`
4. **Approval/Rejection**: Admin approves or rejects documents via `/api/admin/documents/:id/approve` or `/api/admin/documents/:id/reject`
5. **Account Activation**: When all documents are approved:
   - `documentsApproved` is set to `true`
   - `isActive` is set to `true`
   - Reception can now log in

### Login Restrictions

- **Reception**: Cannot log in until `documentsApproved === true` AND `isActive === true`
- **Other Roles**: Can log in immediately after account creation

### Data Access Rules

- **Parents**: Can only view their own activities, meals, and media
- **Teachers**: Cannot create or manage parents
- **Reception**: Cannot access Activity, Meals, Media, News, or Children modules
- **Admin/Reception**: Can view parent data when clicking on parent in list

## Middleware

### Authentication Middleware
- `authenticate` - Verifies JWT token and attaches user to request
- `requireRole(...roles)` - Ensures user has one of the required roles
- `requireAdmin` - Admin-only access
- `requireReception` - Reception-only access
- `requireTeacher` - Teacher-only access
- `requireParent` - Parent-only access
- `requireAdminOrReception` - Admin or Reception access

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected routes with middleware
- CORS configuration
- Rate limiting
- Security headers

## File Structure

```
backend/
├── config/
│   ├── database.js
│   └── migrate.js
├── controllers/
│   ├── adminController.js
│   ├── receptionController.js
│   ├── parentController.js
│   ├── teacherController.js
│   └── authController.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── ...
├── models/
│   ├── User.js
│   ├── Document.js
│   ├── ParentActivity.js
│   ├── ParentMeal.js
│   ├── ParentMedia.js
│   ├── TeacherResponsibility.js
│   ├── TeacherTask.js
│   ├── TeacherWorkHistory.js
│   └── index.js
├── routes/
│   ├── adminRoutes.js
│   ├── receptionRoutes.js
│   ├── parentRoutes.js
│   ├── teacherRoutes.js
│   └── authRoutes.js
├── migrations/
│   └── 20240102000000-update-role-based-schema.js
└── server.js
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Run migrations: `npm run migrate`
4. Start server: `npm run dev` or `npm start`

## Notes

- Removed modules: Children, Schedule, News, Activities (global), Meals (global), Media (global)
- All parent-specific data is now linked to individual parent users
- Teacher profile includes responsibilities, tasks, and work history
- Reception verification is mandatory before login access



