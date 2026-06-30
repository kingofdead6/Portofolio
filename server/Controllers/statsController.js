import asyncHandler from 'express-async-handler';
import Visit from '../Models/Visit.js';
import Contact from '../Models/Contact.js';
import Project from '../Models/Project.js';
import SkillGroup from '../Models/SkillGroup.js';

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10); // YYYY-MM-DD

// @desc    Record a page view (public, fire-and-forget)
// @route   POST /api/stats/visit
export const recordVisit = asyncHandler(async (req, res) => {
  const { path, referrer } = req.body || {};
  await Visit.create({
    path: path || '/',
    referrer: referrer || '',
    day: dayKey(),
  });
  res.status(201).json({ success: true });
});

// @desc    Dashboard summary (admin)
// @route   GET /api/stats
export const getStats = asyncHandler(async (req, res) => {
  const startOfToday = dayKey();
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

  const [
    totalVisits,
    todayVisits,
    totalMessages,
    newMessages,
    totalProjects,
    totalSkillGroups,
    series,
  ] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ day: startOfToday }),
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Project.countDocuments(),
    SkillGroup.countDocuments(),
    Visit.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$day', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build a continuous 7-day series so the chart has no gaps.
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const key = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const hit = series.find((s) => s._id === key);
    days.push({ day: key, count: hit ? hit.count : 0 });
  }

  res.json({
    totalVisits,
    todayVisits,
    totalMessages,
    newMessages,
    totalProjects,
    totalSkillGroups,
    series: days,
  });
});
