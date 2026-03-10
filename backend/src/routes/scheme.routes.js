// backend/src/routes/scheme.routes.js
import express from 'express';
import { getSchemes, getMatchedSchemes, createScheme, seedSchemes } from '../controllers/scheme.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',         protect, getSchemes);
router.get('/matched',  protect, getMatchedSchemes);
router.post('/',        protect, restrictTo('admin'), createScheme);
router.post('/seed',    protect, restrictTo('admin'), seedSchemes);

export default router;