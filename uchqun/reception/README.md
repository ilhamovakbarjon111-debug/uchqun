# Uchqun Reception Panel

Independent frontend project for system administration of the Uchqun Special Education School Management System.

## Features

- **Full System Control**: Complete CRUD access to all system entities
- **Parent Management**: Create, edit, and delete parent accounts with login credentials
- **Media Management**: Manage all media files (photos, videos)
- **Activities Management**: Create and manage all activities
- **Meals Management**: Track and manage meal records
- **Role-Based Access**: Admin-only access with protected routes

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

The admin panel will run on `http://localhost:5174`

### Build

```bash
npm run build
```

## Default Admin Credentials

- **Email**: admin@uchqun.com
- **Password**: admin123

## Project Structure

```
admin-panel/
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

The admin panel uses `localStorage` for frontend-only data persistence. It shares the same storage keys as the main frontend application, allowing seamless data management across both applications.

## Role Hierarchy

- **Admin** → Full system access (this panel)
- **Teacher** → Manage parent-related data
- **Parent** → Read-only access

