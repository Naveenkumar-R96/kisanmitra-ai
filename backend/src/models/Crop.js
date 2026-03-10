// backend/src/models/Crop.js
import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  localNames: {
    hi: String,   // Hindi
    pa: String,   // Punjabi
    ta: String,   // Tamil
    te: String,   // Telugu
    mr: String,   // Marathi
  },
  category: {
    type: String,
    enum: ['cereal', 'pulse', 'oilseed', 'vegetable', 'fruit', 'spice', 'cash_crop'],
    required: true
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'perennial'],
    required: true
  },
  duration: {
    min: Number,   // days
    max: Number
  },
  sowingMonths: [{ type: Number, min: 1, max: 12 }],
  harvestMonths: [{ type: Number, min: 1, max: 12 }],
  waterRequirement: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  commonPests: [String],
  commonDiseases: [String],
  idealSoil: [String],
  idealTemperature: {
    min: Number,
    max: Number
  },
  mspPrice: Number,   // Minimum Support Price ₹/quintal
  image: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Crop', cropSchema);