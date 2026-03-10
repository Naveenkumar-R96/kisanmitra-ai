// backend/src/models/PestReport.js
import mongoose from 'mongoose';

const pestReportSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  imageUrl: {
    type: String,
    required: true
  },
  aiResult: {
    disease: { type: String },
    confidence: { type: Number },      // 0-100
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    isHealthy: { type: Boolean, default: false }
  },
  treatment: {
    chemical: [String],
    organic: [String],
    dosage: String,
    timing: String,
    preventiveMeasures: [String]
  },
  location: {
    district: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  expertVerified: { type: Boolean, default: false },
  expertNote: { type: String },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'verified'],
    default: 'pending'
  }
}, { timestamps: true });

// Index for outbreak heatmap
pestReportSchema.index({ 'location.district': 1, createdAt: -1 });
pestReportSchema.index({ 'aiResult.disease': 1 });

export default mongoose.model('PestReport', pestReportSchema);