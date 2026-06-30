import asyncHandler from 'express-async-handler';
import SkillGroup from '../Models/SkillGroup.js';

// @desc    Get all skill groups (public). Ordered for the Skills section.
// @route   GET /api/skills
export const getSkillGroups = asyncHandler(async (req, res) => {
  const groups = await SkillGroup.find().sort({ order: 1, createdAt: 1 });
  res.json(groups);
});

// @desc    Create a skill group (admin)
// @route   POST /api/skills
export const createSkillGroup = asyncHandler(async (req, res) => {
  const { group } = req.body;
  if (!group) {
    res.status(400);
    throw new Error('Group name is required');
  }
  const created = await SkillGroup.create(req.body);
  res.status(201).json(created);
});

// @desc    Update a skill group (admin)
// @route   PUT /api/skills/:id
export const updateSkillGroup = asyncHandler(async (req, res) => {
  const grp = await SkillGroup.findById(req.params.id);
  if (!grp) {
    res.status(404);
    throw new Error('Skill group not found');
  }
  const fields = ['group', 'label', 'accent', 'items', 'order'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) grp[f] = req.body[f];
  });
  await grp.save();
  res.json(grp);
});

// @desc    Delete a skill group (admin)
// @route   DELETE /api/skills/:id
export const deleteSkillGroup = asyncHandler(async (req, res) => {
  const grp = await SkillGroup.findById(req.params.id);
  if (!grp) {
    res.status(404);
    throw new Error('Skill group not found');
  }
  await SkillGroup.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Skill group deleted' });
});
