// backend/src/routes/community.routes.js
import express from 'express';
import { getPosts, createPost, addReply, toggleLike } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',              protect, getPosts);
router.post('/',             protect, createPost);
router.post('/:id/reply',   protect, addReply);
router.patch('/:id/like',   protect, toggleLike);

export default router;