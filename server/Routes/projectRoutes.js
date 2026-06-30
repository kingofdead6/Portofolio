import express from 'express';
import {
  getProjects,
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../Controllers/projectController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getProjects);

// Admin
router.get('/all', protect, admin, getAllProjects);
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

// Public single (kept last so /all isn't captured by :id)
router.get('/:id', getProject);

export default router;
