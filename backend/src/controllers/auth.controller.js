// backend/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.middleware.js';

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// Geocode village/state to coordinates using OpenWeatherMap
const getCoordinates = async (village, state, district) => {
  try {
    const query    = `${village || district || ''},${state},India`;
    const url      = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${process.env.WEATHER_API_KEY}`;
    const response = await axios.get(url, { timeout: 5000 });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      console.log(`✅ Geocoded ${query} → lat:${lat}, lng:${lon}`);
      return { lat, lng: lon };
    }
  } catch (err) {
    console.log('Geocoding failed:', err.message);
  }

  // Fallback coordinates by state
  const STATE_COORDS = {
    'Punjab':           { lat: 31.1471, lng: 75.3412 },
    'Haryana':          { lat: 29.0588, lng: 76.0856 },
    'Uttar Pradesh':    { lat: 26.8467, lng: 80.9462 },
    'Maharashtra':      { lat: 19.7515, lng: 75.7139 },
    'Tamil Nadu':       { lat: 11.1271, lng: 78.6569 },
    'Karnataka':        { lat: 15.3173, lng: 75.7139 },
    'Gujarat':          { lat: 22.2587, lng: 71.1924 },
    'Rajasthan':        { lat: 27.0238, lng: 74.2179 },
    'Madhya Pradesh':   { lat: 22.9734, lng: 78.6569 },
    'Bihar':            { lat: 25.0961, lng: 85.3131 },
    'Andhra Pradesh':   { lat: 15.9129, lng: 79.7400 },
    'Telangana':        { lat: 18.1124, lng: 79.0193 },
    'Kerala':           { lat: 10.8505, lng: 76.2711 },
    'Odisha':           { lat: 20.9517, lng: 85.0985 },
    'Jharkhand':        { lat: 23.6102, lng: 85.2799 },
    'West Bengal':      { lat: 22.9868, lng: 87.8550 },
    'Assam':            { lat: 26.2006, lng: 92.9376 },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
    'Uttarakhand':      { lat: 30.0668, lng: 79.0193 },
    'Chhattisgarh':     { lat: 21.2787, lng: 81.8661 },
  };

  return STATE_COORDS[state] || { lat: 20.5937, lng: 78.9629 }; // India center
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, phone, password, language, location, farmDetails } = req.body;

  const exists = await User.findOne({ phone });
  if (exists) throw new AppError('Phone number already registered', 400);

  // Get real coordinates for farmer's location
  const coords = await getCoordinates(
    location?.village,
    location?.state,
    location?.district
  );

  const user = await User.create({
    name, phone, password,
    language: language || 'en',
    location: {
      ...location,
      coordinates: coords
    },
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

  // Update coordinates on login if missing
  if (!user.location?.coordinates?.lat && user.location?.state) {
    const coords = await getCoordinates(
      user.location?.village,
      user.location?.state,
      user.location?.district
    );
    await User.findByIdAndUpdate(user._id, {
      'location.coordinates': coords
    });
    user.location.coordinates = coords;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  ApiResponse.success(res, { token, user }, 'Login successful');
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
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