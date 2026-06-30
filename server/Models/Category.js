import mongoose from 'mongoose';

// Mirrors the CATEGORIES entries in the old client data.js so the Work rail
// renders identically. `key` ties projects to a category; `accent` colour-zones
// the rail.
const categorySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  sub: { type: String, trim: true, default: '' },
  accent: { type: String, trim: true, default: '#7866FF' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
