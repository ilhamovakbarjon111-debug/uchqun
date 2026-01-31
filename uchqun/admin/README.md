# Uchqun Admin Panel

Independent frontend project for administrator access to the Uchqun Special Education School Management System.

## Features

- **Complete System Control**: Full access to all system entities and configurations
- **User Management**: Manage Parents, Teachers, and Admins with full CRUD operations
- **Child Management**: Complete student profiles with medical info, groups, and assignments
- **Group & Schedule Management**: Manage groups, assign teachers, create schedules
- **Content Management**: Media, Activities, Meals, News & Notifications
- **Reports & Analytics**: Comprehensive system statistics and dashboards
- **System Settings**: Configure roles, permissions, security, and app settings

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The super admin panel will run on `http://localhost:5175`

### Build

```bash
npm run build
```

## Default Super Admin Credentials

- **Email**: superadmin@uchqun.com
- **Password**: superadmin123

## Project Structure

```
super-admin/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React contexts (Auth, Toast)
│   ├── pages/           # Page components
│   ├── services/        # Data services (dataStore)
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Data Storage

The super admin panel uses `localStorage` for frontend-only data persistence. It shares the same storage keys as other applications, allowing seamless data management across the system.

## Role Hierarchy

- **Super Admin** → Complete system access (this panel)
- **Admin** → Full system access (admin panel)
- **Teacher** → Manage parent-related data
- **Parent** → Read-only access

