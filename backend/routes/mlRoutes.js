import express from 'express';
import {
  predict,
  explain,
  getModels,
  getHistory,
} from '../controllers/mlController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get available models and schema (public or optional auth)
router.get('/models', getModels);

// Predict & Explain (supports optionalAuth to link with user if logged in)
router.post('/predict', optionalAuth, predict);
router.post('/explain', optionalAuth, explain);

// History (requires authentication)
router.get('/history', protect, getHistory);

export default router;
