// backend/src/routes/advisory.routes.js
import express from 'express';
import { getAdvisories, generateAdvisory, markAsRead } from '../controllers/advisory.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',              protect, getAdvisories);
router.post('/generate',     protect, generateAdvisory);
router.patch('/:id/read',    protect, markAsRead);

export default router;