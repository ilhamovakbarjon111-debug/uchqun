import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Support both DATABASE_URL format and individual variables
let sequelize;

if (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) {
  // Use DATABASE_URL if provided (Railway, Heroku, etc.)
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Increased to 60 seconds
      idle: 10000,
    },
    dialectOptions: {
      // Railway public URLs require SSL
      ssl: (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) ? {
        require: true,
        rejectUnauthorized: false
      } : (process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false),
      connectTimeout: 60000, // 60 seconds connection timeout
    },
    retry: {
      max: 3, // Retry up to 3 times
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /SequelizeConnectionError/,
      ],
    }
  });
} else {
  // Use individual variables
  sequelize = new Sequelize(
    process.env.DB_NAME || 'uchqun',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 60000, // Increased to 60 seconds
        idle: 10000,
      },
      dialectOptions: {
        connectTimeout: 60000, // 60 seconds connection timeout
      },
      retry: {
        max: 3, // Retry up to 3 times
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /SequelizeConnectionError/,
        ],
      },
    }
  );
}

export default sequelize;



