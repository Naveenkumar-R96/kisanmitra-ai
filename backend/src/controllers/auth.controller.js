// backend/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.middleware.js';

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, language, location, farmDetails } = req.body;

  const exists = await User.findOne({ phone });
  if (exists) throw new AppError('Phone number already registered', 400);

  const user = await User.create({
    name, phone, password,
    language: language || 'hi',
    location,
    farmDetails
  });

  const token = signToken(user._id);

  ApiResponse.success(res, { token, user }, 'Registration successful', 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new AppError('Phone and password are required', 400);
  }

  const user = await User.findOne({ phone }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid phone or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  ApiResponse.success(res, { token, user }, 'Login successful');
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('crops');
  ApiResponse.success(res, { user }, 'User fetched');
});

// PATCH /api/auth/update-profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'language', 'location', 'farmDetails', 'fcmToken'];
  const updates = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  ApiResponse.success(res, { user }, 'Profile updated');
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  const token = signToken(user._id);
  ApiResponse.success(res, { token }, 'Password changed successfully');
});