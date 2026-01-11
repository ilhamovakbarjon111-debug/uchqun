# IMHA Teacher Frontend

Standalone React application for teacher/admin users to manage the IMHA Special Education School Management platform.

## Features

- **Parent Management**: Create, edit, and manage parent accounts
- **Activities Management**: Create and manage student activities
- **Meals Management**: Track and manage student meals
- **Media Gallery**: Upload and manage photos and videos
- **Dashboard**: Overview of all statistics and quick actions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
VITE_API_URL=https://uchqun-production-4f83.up.railway.app/api
```

For local development:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5174` (different port from parent frontend)

## Build

To build for production:
```bash
npm run build
```

## Project Structure

```
teacher/
├── src/
│   ├── components/      # Teacher-specific components
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── pages/          # Teacher pages
│   │   ├── Dashboard.jsx
│   │   ├── ParentManagement.jsx
│   │   ├── Activities.jsx
│   │   ├── Meals.jsx
│   │   ├── Media.jsx
│   │   └── Login.jsx
│   └── shared/         # Shared components and utilities
│       ├── components/
│       ├── context/
│       └── services/
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Backend API

This frontend connects to the backend API at `https://uchqun-production-4f83.up.railway.app/api` (production) or `http://localhost:5000/api` (local development). Make sure the backend is running before starting the frontend.

## Deploy (Vercel)

This project is a Vite SPA with client-side routing (e.g. `/teacher`). For Vercel we include `teacher/vercel.json` rewrite so refresh/deep-links won't 404.

- **Root Directory**: `teacher`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL` = `https://uchqun-production-4f83.up.railway.app/api`

## Login

Use teacher credentials to log in:
- Email: `teacher@example.com`
- Password: `teacher123`

(Default teacher account - change password after first login)



