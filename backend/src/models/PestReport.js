// backend/src/models/PestReport.js
import mongoose from 'mongoose';

const pestReportSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: { type: String },
  aiResult: {
    disease:    { type: String, required: true },
    confidence: { type: Number, min: 0, max: 100 },
    severity:   {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'unknown'],
      default: 'mild'
    },
    isHealthy:  { type: Boolean, default: false }
  },
  treatment: {
    chemical:           [String],
    organic:            [String],
    dosage:             String,
    timing:             String,
    preventiveMeasures: [String]
  },
  location: {
    district: String,
    state:    String,
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'failed'],
    default: 'analyzed'
  }
}, { timestamps: true });

pestReportSchema.index({ farmer: 1, createdAt: -1 });
pestReportSchema.index({ 'location.district': 1 });

export default mongoose.model('PestReport', pestReportSchema);