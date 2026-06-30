import mongoose from 'mongoose';

// One item inside a skill group — matches the frontend tile shape:
//   n (name), i (devicon path or null), level (0-100), note
const skillItemSchema = new mongoose.Schema({
  n: { type: String, required: true, trim: true },
  i: { type: String, default: null }, // devicon path (fallback if no image)
  image: {
    url: { type: String, default: null },
    public_id: { type: String, default: null },
  },
  level: { type: Number, default: 0, min: 0, max: 100 },
  note: { type: String, default: '', trim: true },
}, { _id: false });

// Mirrors the SKILLS groups in the old client data.js.
const skillGroupSchema = new mongoose.Schema({
  group: { type: String, required: true, trim: true },
  label: { type: String, trim: true, default: '' },
  accent: { type: String, trim: true, default: '#7866FF' },
  items: { type: [skillItemSchema], default: [] },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('SkillGroup', skillGroupSchema);
