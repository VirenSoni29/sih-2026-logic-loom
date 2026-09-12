import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UserModel from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper to generate JWT token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Helper to send response with token and cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user.id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  // Remove password from user object if present
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  return sendSuccess(
    res,
    message,
    {
      user: sanitizedUser,
      token,
    },
    statusCode
  );
};

// 1. Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 400);
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return sendError(res, 'A user with this email already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in DB
    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
    });

    return sendTokenResponse(newUser, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// 2. Log in an existing user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password.', 400);
    }

    // Find user with password hash
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    return sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// 3. Log out user (clear cookie)
export const logout = async (req, res) => {
  res.cookie('token', 'logged_out', {
    expires: new Date(Date.now() + 500),
    httpOnly: true,
  });

  return sendSuccess(res, 'Logged out successfully');
};

// 4. Get currently logged in user profile
export const getMe = async (req, res) => {
  return sendSuccess(res, 'Current user profile retrieved', {
    user: req.user,
  });
};

// 5. Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return sendError(res, 'Please provide a name to update.', 400);
    }

    const updatedUser = await UserModel.updateProfile(req.user.id, { name });
    return sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// 6. Update password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Please provide current and new password.', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters.', 400);
    }

    const user = await UserModel.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const updatedUser = await UserModel.updatePassword(req.user.id, passwordHash);

    return sendTokenResponse(updatedUser, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
