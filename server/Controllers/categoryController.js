import asyncHandler from 'express-async-handler';
import Category from '../Models/Category.js';

// @desc    Get all categories (public). Ordered for the Work rail.
// @route   GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, createdAt: 1 });
  res.json(categories);
});

// @desc    Create a category (admin)
// @route   POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { key, label } = req.body;
  if (!key || !label) {
    res.status(400);
    throw new Error('Key and label are required');
  }
  const exists = await Category.findOne({ key });
  if (exists) {
    res.status(400);
    throw new Error('Category key already exists');
  }
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

// @desc    Update a category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  const fields = ['key', 'label', 'sub', 'accent', 'order'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  res.json(category);
});

// @desc    Delete a category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await Category.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Category deleted' });
});
