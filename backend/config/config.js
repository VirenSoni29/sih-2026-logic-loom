import dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  
  // Python ML Microservice URL
  ML_SERVICE_URL: process.env.ML_SERVICE_URL,
  
  // CORS Origin
  CLIENT_URL: process.env.CLIENT_URL,
};

export default config;