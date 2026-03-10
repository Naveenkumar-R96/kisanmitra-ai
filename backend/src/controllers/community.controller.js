// backend/src/controllers/community.controller.js
import Community from '../models/Community.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.middleware.js';

// GET /api/community
export const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, tag } = req.query;
  const query = {};
  if (category) query.category = category;
  if (tag) query.tags = tag;

  const total = await Community.countDocuments(query);
  const posts = await Community.find(query)
    .populate('author', 'name location.village role')
    .populate('crop', 'name')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  ApiResponse.paginated(res, posts, total, page, limit);
});

// POST /api/community
export const createPost = asyncHandler(async (req, res) => {
  const post = await Community.create({ ...req.body, author: req.user._id });
  await post.populate('author', 'name location.village role');
  ApiResponse.success(res, post, 'Post created', 201);
});

// POST /api/community/:id/reply
export const addReply = asyncHandler(async (req, res) => {
  const post = await Community.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  post.replies.push({
    author: req.user._id,
    message: req.body.message,
    isExpert: ['aeo', 'admin'].includes(req.user.role)
  });

  await post.save();
  await post.populate('replies.author', 'name role');
  ApiResponse.success(res, post, 'Reply added');
});

// PATCH /api/community/:id/like
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Community.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const liked = post.likes.includes(req.user._id);
  if (liked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  ApiResponse.success(res, { likes: post.likes.length, liked: !liked }, 'Like toggled');
});