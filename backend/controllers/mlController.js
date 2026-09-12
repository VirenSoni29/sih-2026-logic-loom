import config from '../config/config.js';
import PredictionModel from '../models/predictionModel.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper to make requests to the Python AI service
const callPythonMLService = async (endpoint, payload = null, method = 'POST') => {
  const url = `${config.ML_SERVICE_URL}${endpoint}`;
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (payload && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || data.message || 'Error from ML service';
      const error = new Error(errorMessage);
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.cause?.code === 'ECONNREFUSED') {
      const error = new Error(
        `Python ML service is not reachable at ${config.ML_SERVICE_URL}. Please start the Python microservice using 'python server.py' in the 'ml_service' directory.`
      );
      error.statusCode = 503;
      throw error;
    }
    throw err;
  }
};

/**
 * 1. Predict: Send features to selected model (XGBoost / Random Forest)
 * POST /api/ml/predict
 */
export const predict = async (req, res, next) => {
  try {
    const { model = 'random_forest', features } = req.body;

    if (!features) {
      return sendError(
        res,
        'Please provide "features" in the request body (either as an object with named features or an array of values).',
        400
      );
    }

    const mlResponse = await callPythonMLService('/predict', {
      model,
      features,
    });

    // Optionally save to database if user is authenticated or guest
    const userId = req.user ? req.user.id : null;
    await PredictionModel.create({
      userId,
      modelName: model,
      inputFeatures: features,
      predictionResult: mlResponse,
    });

    return sendSuccess(res, 'Prediction computed successfully', mlResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Explain: Compute SHAP / Explainable AI feature contributions & breakdown
 * POST /api/ml/explain
 */
export const explain = async (req, res, next) => {
  try {
    const { model = 'random_forest', features } = req.body;

    if (!features) {
      return sendError(
        res,
        'Please provide "features" in the request body to generate Explainable AI results.',
        400
      );
    }

    const mlResponse = await callPythonMLService('/explain', {
      model,
      features,
    });

    // Optionally log explanation
    const userId = req.user ? req.user.id : null;
    await PredictionModel.create({
      userId,
      modelName: model,
      inputFeatures: features,
      predictionResult: mlResponse.prediction,
      explanationResult: mlResponse.explanation,
    });

    return sendSuccess(res, 'Explainable AI breakdown computed successfully', mlResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. List available models & schema
 * GET /api/ml/models
 */
export const getModels = async (req, res, next) => {
  try {
    const mlResponse = await callPythonMLService('/schema', null, 'GET');
    return sendSuccess(res, 'Available ML models retrieved', mlResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get current user's prediction history
 * GET /api/ml/history
 */
export const getHistory = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to view history.', 401);
    }

    const history = await PredictionModel.findByUserId(req.user.id, 50);
    return sendSuccess(res, 'Prediction history retrieved', { history });
  } catch (error) {
    next(error);
  }
};
