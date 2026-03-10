// backend/src/models/Scheme.js
import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String },
  ministry: { type: String },
  category: {
    type: String,
    enum: ['insurance', 'subsidy', 'loan', 'equipment', 'training', 'income_support'],
    required: true
  },
  description: { type: String, required: true },
  benefits: [String],
  eligibility: {
    minLandSize: Number,         // acres
    maxLandSize: Number,
    minAge: Number,
    maxAge: Number,
    states: [String],            // empty = all India
    categories: [String],        // SC, ST, OBC, General
    crops: [String],
    incomeLimit: Number
  },
  documents: [String],
  applicationUrl: { type: String },
  helplineNumber: { type: String },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  isNational: { type: Boolean, default: true },
  state: { type: String }        // if state-specific
}, { timestamps: true });

export default mongoose.model('Scheme', schemeSchema);