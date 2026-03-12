// backend/src/routes/notification.routes.js
import express from 'express';
import {
  subscribe,
  unsubscribe,
  broadcast,
  getVapidKey
} from '../controllers/notification.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/vapid-key',  protect, getVapidKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.post('/broadcast', protect, restrictTo('admin'), broadcast);

export default router;