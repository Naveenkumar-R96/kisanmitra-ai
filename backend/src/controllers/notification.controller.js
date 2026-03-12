// backend/src/controllers/notification.controller.js
import User from '../models/User.js';
import { sendPushToAll } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/notifications/subscribe
export const subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) {
    return ApiResponse.error(res, 'Subscription required', 400);
  }

  await User.findByIdAndUpdate(req.user._id, {
    pushSubscription: subscription
  });

  ApiResponse.success(res, null, 'Push subscription saved');
});

// POST /api/notifications/unsubscribe
export const unsubscribe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { pushSubscription: 1 }
  });
  ApiResponse.success(res, null, 'Unsubscribed');
});

// POST /api/notifications/broadcast (admin only)
export const broadcast = asyncHandler(async (req, res) => {
  const { title, body, url } = req.body;
  await sendPushToAll({ title, body, url: url || '/' });
  ApiResponse.success(res, null, 'Broadcast sent');
});

// GET /api/notifications/vapid-key
export const getVapidKey = asyncHandler(async (req, res) => {
  ApiResponse.success(res, {
    publicKey: process.env.VAPID_PUBLIC_KEY
  }, 'VAPID key fetched');
});