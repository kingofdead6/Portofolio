import mongoose from 'mongoose';

// Mirrors the PROJECTS entries in the old client data.js exactly so the Work
// section + ProjectPage render unchanged. Field names match the frontend:
//   t (title), category (key), cat (subtitle), year, blurb, desc, stack, c1, c2
const projectSchema = new mongoose.Schema({
  t: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true }, // ties to Category.key
  cat: { type: String, trim: true, default: '' },
  year: { type: String, trim: true, default: '' },
  blurb: { type: String, trim: true, default: '' },
  desc: { type: String, default: '' },
  stack: { type: [String], default: [] },
  liveUrl: { type: String, trim: true, default: '' },
  sourceUrl: { type: String, trim: true, default: '' },
  c1: { type: String, default: '#7866FF' },
  c2: { type: String, default: '#2A1C9E' },
  image: {
    url: { type: String, default: null },
    public_id: { type: String, default: null },
  },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
