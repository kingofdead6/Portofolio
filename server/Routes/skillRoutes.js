import express from 'express';
import {
  getSkillGroups,
  createSkillGroup,
  updateSkillGroup,
  deleteSkillGroup,
} from '../Controllers/skillController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getSkillGroups);

// Admin
router.post('/', protect, admin, createSkillGroup);
router.put('/:id', protect, admin, updateSkillGroup);
router.delete('/:id', protect, admin, deleteSkillGroup);

export default router;
