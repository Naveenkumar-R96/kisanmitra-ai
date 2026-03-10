// backend/src/routes/pest.routes.js
import express from 'express';
import { analyzePest, getPestHistory, getOutbreaks, upload } from '../controllers/pest.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/analyze',   protect, upload.single('image'), analyzePest);
router.get('/history',    protect, getPestHistory);
router.get('/outbreaks',  protect, restrictTo('admin', 'aeo'), getOutbreaks);

export default router;