// backend/src/models/Community.js
import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  images: [String],
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  tags: [String],
  category: {
    type: String,
    enum: ['question', 'tip', 'success_story', 'alert'],
    default: 'question'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    isExpert: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  isSolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false }
}, { timestamps: true });

communitySchema.index({ tags: 1 });
communitySchema.index({ createdAt: -1 });

export default mongoose.model('Community', communitySchema);