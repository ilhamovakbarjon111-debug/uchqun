# Railway Deployment Setup Guide

This guide explains how to configure environment variables in Railway for the uchqun backend.

## Required Environment Variables

Railway automatically provides `DATABASE_URL` when you connect a Postgres service. You still need to set the following variables manually:

### 1. JWT Configuration (Required)

These must be set in Railway's environment variables:

```
JWT_SECRET=<your-secret-key-min-32-characters>
JWT_REFRESH_SECRET=<your-refresh-secret-key-min-32-characters>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

**Important:** Both `JWT_SECRET` and `JWT_REFRESH_SECRET` must be at least 32 characters long and different from each other.

### 2. Frontend URL (Required)

You can set a single URL or multiple URLs separated by commas:

**Single URL:**
```
FRONTEND_URL=https://your-frontend-domain.com
```

**Multiple URLs (for multiple frontend applications):**
```
FRONTEND_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,https://uchqun-platform.vercel.app
```

**IMPORTANT:** Make sure to include ALL frontend URLs that will access the backend, including:
- Local development URLs (localhost:5173, etc.)
- Production frontend URLs (Vercel, Railway, etc.)

**For this project, use:**
```
FRONTEND_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,https://uchqun-platform.vercel.app
```

For production, use your actual frontend URLs with HTTPS.

### 3. Database Configuration

**Railway automatically provides `DATABASE_URL`** when you connect a Postgres service. You don't need to set individual DB variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, etc.) if `DATABASE_URL` is available.

If you need to use individual variables instead, set:
```
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<from-railway-postgres-service>
DB_HOST=<from-railway-postgres-service>
DB_PORT=5432
```

### 4. Optional Configuration

```
NODE_ENV=production
PORT=5000
FORCE_SYNC=false
```

## Recommended: railway.toml

This repo includes `backend/railway.toml` which sets:
- `startCommand`: `npm start`
- `healthcheckPath`: `/health`

In Railway, set **Root Directory** to `backend` so this config is picked up.

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on the `uchqun` service
3. Go to the **Variables** tab
4. Click **+ New Variable** for each required variable
5. Add the following variables:

   - `JWT_SECRET` - Generate a secure random string (at least 32 characters)
   - `JWT_REFRESH_SECRET` - Generate a different secure random string (at least 32 characters)
   - `FRONTEND_URL` - Your frontend application URL(s). For multiple frontends, separate with commas (e.g., `https://admin.vercel.app,https://teacher.vercel.app`)
   - `NODE_ENV=production` (optional, defaults to development)
   - `PORT=5000` (optional, Railway sets this automatically)

## Generating Secure JWT Secrets

You can generate secure secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## Connecting Postgres Service

1. In Railway, add a **Postgres** service to your project
2. Railway will automatically:
   - Create a `DATABASE_URL` environment variable
   - Make it available to connected services
3. Your `uchqun` service should automatically connect to the Postgres service

## Verification

After setting all variables, your Railway deployment should:
1. Pass environment variable validation
2. Connect to the Postgres database
3. Run migrations automatically
4. Start the server successfully

## Troubleshooting

### "Environment variable validation failed"

Make sure you've set:
- `JWT_SECRET` (min 32 characters)
- `JWT_REFRESH_SECRET` (min 32 characters, different from JWT_SECRET)
- `FRONTEND_URL` (valid URL)

### "DATABASE_URL is required"

- Ensure you've added a Postgres service in Railway
- Check that the Postgres service is connected to your `uchqun` service
- Railway should automatically provide `DATABASE_URL`

### Service keeps crashing

1. Check the deployment logs in Railway
2. Verify all required environment variables are set
3. Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are different
4. Check that `FRONTEND_URL` is a valid URL (or comma-separated URLs)

