import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UserModel from '../models/userModel.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Protect routes: Requires valid JWT token in Bearer header or Cookie
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1) Extract token from Authorization header (Bearer <token>)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2) Or extract token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(
        res,
        'Authentication required. Please log in to access this resource.',
        401
      );
    }

    // 3) Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // 4) Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      return sendError(
        res,
        'The user belonging to this token no longer exists.',
        401
      );
    }

    // 5) Grant access: attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Auth: Attaches user if token is provided, but allows unauthenticated requests
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const currentUser = await UserModel.findById(decoded.id);
        if (currentUser) {
          req.user = currentUser;
        }
      } catch (err) {
        // Silently continue for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to specified roles (e.g. 'admin')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        'You do not have permission to perform this action.',
        403
      );
    }
    next();
  };
};
