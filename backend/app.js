import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config/config.js';
import authRoutes from './routes/authRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser(config.COOKIE_SECRET));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is active and healthy',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/ml', mlRoutes);

// Handle 404 for unknown API routes
app.all('/api/{*any}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;