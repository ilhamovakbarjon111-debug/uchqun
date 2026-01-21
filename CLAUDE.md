# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Uchqun is a full-stack platform for special education school management. It's a monorepo with a Node.js/Express backend and multiple frontend applications (React web apps + React Native mobile app).

**Role hierarchy**: Super Admin > Admin > Reception > Teacher > Parent

## Repository Structure

```
uchqun/
├── backend/       # Node.js/Express API with PostgreSQL/Sequelize
├── mobile/        # React Native (Expo) app
├── admin/         # Admin dashboard (React + Vite)
├── teacher/       # Teacher dashboard (React + Vite)
├── super-admin/   # Super admin panel (React + Vite)
├── reception/     # Reception management (React + Vite)
└── shared/        # Shared components & services
```

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start dev server with nodemon (port 5000)
npm run seed         # Seed database with initial data
npm run migrate      # Run database migrations
npm run test:db      # Test database connection
npm run create:teacher    # Create a teacher account
npm run create:admin      # Create an admin account
npm run create:super-admin # Create a super admin account
```

### Mobile (Expo)
```bash
cd mobile
npm run dev          # Start Expo dev server
npm run dev:tunnel   # Start with tunnel mode for real devices
npm run android      # Build/run Android
npm run ios          # Build/run iOS
```

### Web Frontends (admin, teacher, reception, super-admin)
```bash
cd [app-name]
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm start            # Serve built app via Express
```

## Tech Stack

- **Backend**: Node.js 18+, Express 4.18, PostgreSQL 12+, Sequelize ORM, JWT auth
- **Web Apps**: React 18, Vite, Tailwind CSS, React Router, Axios, i18next
- **Mobile**: React Native 0.81, Expo SDK 54, React Navigation
- **File Storage**: Google Cloud Storage (with local fallback)
- **AI**: OpenAI API for chat features

## Architecture Notes

### Authentication
- JWT-based with access and refresh tokens
- Role-based access control (RBAC) via middleware in `backend/middleware/auth.js`
- Tokens stored in AsyncStorage (mobile) or localStorage (web)

### API Structure
- All routes under `/api/` prefix
- Role-specific route groups: `/api/admin/*`, `/api/teacher/*`, `/api/parent/*`, etc.
- Controllers in `backend/controllers/`, routes in `backend/routes/`

### Database Models
Core models in `backend/models/`: User, Child, Activity, Meal, Media, Document, Progress, Group, School, ChatMessage, Notification

### State Management
All apps use React Context API for auth state. See `AuthContext.js` in each app's `context/` folder.

### Frontend Port Assignments
- Backend API: 5000
- Teacher: 5174
- Admin: 5175
- Other web apps may vary (check vite.config.js)

## Environment Variables

Backend requires `.env` (copy from `env.example`):
```
DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
JWT_SECRET, JWT_REFRESH_SECRET
OPENAI_API_KEY (for AI chat)
GCP_PROJECT_ID, GCP_BUCKET_NAME (for cloud storage)
```

Frontend apps need:
```
VITE_API_URL=http://localhost:5000/api
```

## Default Test Credentials
- Super Admin: `superadmin@uchqun.com` / `superadmin123`
- Admin: `admin@uchqun.com` / `admin123`
- Teacher: `teacher@example.com` / `teacher123`
- Parent: `parent@example.com` / `password`

You are a senior software engineer and system architect.

Rules:
- Always read relevant files before responding
- Make direct changes when asked
- Prefer production-ready solutions
- Do not over-explain unless requested
- Assume this project will scale

Behavior:
- If unsure, ask one clear question
- Otherwise, act decisively

