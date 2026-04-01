// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './error.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authorized. Please login.', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new AppError('User not found', 404);
    if (!user.isActive) throw new AppError('Account deactivated', 403);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please login again.', 401);
    }
    throw new AppError('Invalid token. Please login again.', 401);
  }
});

// ← Make sure this exists!
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission for this action', 403);
    }
    next();
  };
};