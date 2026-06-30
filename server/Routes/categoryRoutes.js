import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../Controllers/categoryController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getCategories);

// Admin
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
