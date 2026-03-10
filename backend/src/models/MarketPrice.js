// backend/src/models/MarketPrice.js
import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    trim: true
  },
  mandi: {
    name: { type: String, required: true },
    district: { type: String },
    state: { type: String },
  },
  prices: {
    min: { type: Number },
    max: { type: Number },
    modal: { type: Number, required: true },   // most traded price
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  date: {
    type: Date,
    default: Date.now
  },
  prediction: {
    price7Days: Number,
    price14Days: Number,
    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable']
    },
    confidence: Number,
    recommendation: {
      type: String,
      enum: ['sell_now', 'wait', 'hold']
    }
  },
  source: {
    type: String,
    default: 'AGMARKNET'
  }
}, { timestamps: true });

marketPriceSchema.index({ crop: 1, 'mandi.name': 1, date: -1 });

export default mongoose.model('MarketPrice', marketPriceSchema);