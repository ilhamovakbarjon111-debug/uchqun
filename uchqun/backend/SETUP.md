# Backend Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure PostgreSQL

1. Make sure PostgreSQL is installed and running on your system.

2. Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
# Update these with your actual PostgreSQL credentials
DB_NAME=uchqun
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Database Sync
FORCE_SYNC=false
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password.

## Step 3: Create PostgreSQL Database

Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE uchqun;
```

Or using command line:
```bash
createdb uchqun
```

## Step 4: Seed the Database

```bash
npm run seed
```

This will create:
- A parent user (email: `parent@example.com`, password: `password`)
- Sample child profile
- Sample activities, meals, media, and progress data

## Step 5: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Troubleshooting

### Authentication Error (28P01)
- Check that your PostgreSQL password in `.env` is correct
- Verify PostgreSQL is running: `pg_isready` or check services
- Try connecting manually: `psql -U postgres -d uchqun`

### Database Connection Error
- Ensure PostgreSQL service is running
- Check that the database `uchqun` exists
- Verify host and port in `.env` match your PostgreSQL configuration

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000



