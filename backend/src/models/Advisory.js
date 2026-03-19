// backend/src/models/Advisory.js
import mongoose from 'mongoose';

const advisorySchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: false  // optional — not all advisories are crop-specific
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['daily', 'weather_alert', 'pest_warning', 'irrigation', 'fertilizer', 'harvest', 'general'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  actions: [{
    step:   Number,
    action: String,
    timing: String
  }],
  weatherContext: {
    temperature: Number,
    humidity:    Number,
    rainfall:    Number,
    condition:   String
  },
  cropStage: {
    type: String,
    enum: ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'],
    default: 'vegetative'
  },
  language:    { type: String, default: 'en' },
  isRead:      { type: Boolean, default: false },
  isNotified:  { type: Boolean, default: false }
}, { timestamps: true });

advisorySchema.index({ farmer: 1, date: -1 });
advisorySchema.index({ farmer: 1, isRead: 1 });

export default mongoose.model('Advisory', advisorySchema);