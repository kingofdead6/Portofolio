import mongoose from 'mongoose';

// One row per page view. Kept lightweight; aggregation happens in the
// stats controller so the admin dashboard can show totals / time series.
const visitSchema = new mongoose.Schema({
  path: { type: String, default: '/', trim: true },
  referrer: { type: String, default: '', trim: true },
  // YYYY-MM-DD bucket so daily aggregation is a simple group-by.
  day: { type: String, index: true },
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
