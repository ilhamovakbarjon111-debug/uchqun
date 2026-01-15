# Uchqun Backend API

Backend API for Uchqun Platform - Special Education School Management System.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ installed and running

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_NAME=uchqun
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

3. Create PostgreSQL database:
```bash
createdb uchqun
# Or using psql:
# psql -U postgres
# CREATE DATABASE uchqun;
```

4. Seed the database with initial data:
```bash
npm run seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)

### Child Profile
- `GET /api/child` - Get child profile (protected)
- `PUT /api/child` - Update child profile (protected)

### Activities
- `GET /api/activities` - Get activities (protected)
  - Query params: `type`, `limit`, `offset`, `date`
- `GET /api/activities/:id` - Get single activity (protected)

### Meals
- `GET /api/meals` - Get meals (protected)
  - Query params: `date`, `mealType`, `limit`, `offset`
- `GET /api/meals/:id` - Get single meal (protected)

### Media
- `GET /api/media` - Get media items (protected)
  - Query params: `type`, `limit`, `offset`, `date`
- `GET /api/media/:id` - Get single media item (protected)

### Progress
- `GET /api/progress` - Get progress data (protected)
- `PUT /api/progress` - Update progress data (protected)

### User
- `PUT /api/user/profile` - Update user profile (protected)
- `PUT /api/user/password` - Change password (protected)

### Teacher Management (Teacher/Admin only)
- `GET /api/teacher/parents` - Get all parents (protected, teacher/admin)
  - Query params: `search`, `limit`, `offset`
- `GET /api/teacher/parents/:id` - Get single parent (protected, teacher/admin)
- `POST /api/teacher/parents` - Create new parent account (protected, teacher/admin)
  - Body: `{ email, password, firstName, lastName, phone? }`
- `PUT /api/teacher/parents/:id` - Update parent account (protected, teacher/admin)
- `PUT /api/teacher/parents/:id/password` - Set/reset parent password (protected, teacher/admin)
  - Body: `{ password }`
- `DELETE /api/teacher/parents/:id` - Delete parent account (protected, teacher/admin)

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Login Response
```json
{
  "success": true,
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "parent@example.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    ...
  }
}
```

## Database Models

- **User** - Parent/teacher/admin accounts
- **Child** - Child profiles linked to parents
- **Activity** - Daily activities and reports
- **Meal** - Meal tracking records
- **Media** - Photos and videos
- **Progress** - Academic, social, and behavioral progress

## Development

### Database Sync
The database will automatically sync on server start. To force recreate tables:
```env
FORCE_SYNC=true
```

### Seed Data
The seed script creates only the database structure (tables and relationships). No demo users or sample data are created.

**To get started:**
1. Create teacher accounts manually or through your admin interface
2. Teachers can create parent accounts using: `POST /api/teacher/parents`
3. Parents log in with passwords set by teachers

**Note:** Parents log in with passwords set by teachers. Teachers can create parent accounts and set/reset their passwords through the teacher management API.

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message",
  "details": ["Additional details if available"]
}
```

## License

MIT

