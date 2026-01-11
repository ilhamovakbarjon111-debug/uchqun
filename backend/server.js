import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncDatabase } from './models/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import security middleware
import { securityHeaders, enforceHTTPS } from './middleware/security.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './utils/logger.js';

// Validate environment variables
import './config/env.js';

// Setup error tracking
import './utils/errorTracker.js';

// Import routes
import healthRoutes from './routes/health.js';
import authRoutes from './routes/authRoutes.js';
// New role-based routes
import adminRoutes from './routes/adminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import receptionRoutes from './routes/receptionRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import childRoutes from './routes/childRoutes.js';
// Activity, meal, and media routes
import activityRoutes from './routes/activityRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
// Legacy routes (kept for backward compatibility if needed)
import progressRoutes from './routes/progressRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadsRoot = process.env.LOCAL_UPLOADS_DIR || path.join(process.cwd(), 'uploads');

// Security middleware (should be first)
app.use(securityHeaders);

// HTTPS enforcement (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(enforceHTTPS);
}

// Trust proxy (needed for HTTPS behind reverse proxy)
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://uchqun-platform.vercel.app',
    ];

// Default: allow all origins unless explicitly made strict
const allowAllOrigins = process.env.CORS_STRICT === 'true' ? false : true;

// Log allowed origins in development
if (process.env.NODE_ENV === 'development') {
  logger.info('CORS allowed origins:', { origins: allowedOrigins });
}

app.use(cors({
  origin: (origin, callback) => {
    if (allowAllOrigins) {
      return callback(null, true);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        // Log blocked origin for debugging
        if (process.env.NODE_ENV === 'development') {
          logger.warn('CORS blocked origin:', { origin, allowedOrigins });
        }
        callback(new Error(`CORS: Origin ${origin} is not allowed`));
      }
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Authorization',
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count'
  ],
  maxAge: 86400, // Cache preflight requests for 24 hours
  preflightContinue: false, // Let cors handle preflight
  optionsSuccessStatus: 204 // Some legacy browsers (IE11) choke on 204
}));

// Request logging (should be after body parsing but before routes)
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads (works for both fallback and misconfigured remote storage)
app.use('/uploads', express.static(localUploadsRoot));
app.use('/uploads', express.static('uploads'));

// Health check routes (before API routes, no rate limiting)
app.use('/health', healthRoutes);

// API Routes
// Authentication (public)
app.use('/api/auth', authRoutes);

// Super Admin routes (public, protected by secret key)
app.use('/api/super-admin', superAdminRoutes);

// Role-based routes
app.use('/api/admin', adminRoutes);        // Admin routes (document verification, reception management)
app.use('/api/reception', receptionRoutes); // Reception routes (teacher/parent management, document upload)
app.use('/api/parent', parentRoutes);       // Parent routes (view own activities, meals, media)
app.use('/api/teacher', teacherRoutes);     // Teacher routes (responsibilities, tasks, work history)
app.use('/api/child', childRoutes);         // Child routes (child management for parents)

// Activity, meal, and media routes
app.use('/api/activities', activityRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Legacy routes (kept for backward compatibility if needed)
app.use('/api/progress', progressRoutes);
app.use('/api/groups', groupRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // In production, run migrations instead of sync
    if (process.env.NODE_ENV === 'production') {
      console.log('Running database migrations...');
      const { runMigrations } = await import('./config/migrate.js');
      await runMigrations();
    } else {
      // In development, still allow sync for convenience (but warn)
      const forceSync = process.env.FORCE_SYNC === 'true';
      if (forceSync) {
        console.warn('⚠ WARNING: FORCE_SYNC is enabled. This will drop all tables!');
      }
      await syncDatabase(forceSync);
    }

    app.listen(PORT, () => {
      logger.info(`Server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        apiUrl: `http://localhost:${PORT}/api`,
      });
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

