// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'aeo', 'admin'],
    default: 'farmer'
  },
  language: {
    type: String,
    enum: ['hi', 'en', 'pa', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml'],
    default: 'hi'
  },
  location: {
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  farmDetails: {
    landSize: { type: Number },          // in acres
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalky', 'unknown'],
      default: 'unknown'
    },
    irrigationType: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'rainfed', 'none'],
      default: 'rainfed'
    },
    soilHealthCardNo: { type: String }
  },
  crops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  fcmToken: { type: String },            // for push notifications
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  avatar: { type: String }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);