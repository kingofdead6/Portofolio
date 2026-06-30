import express from 'express';
import {
  createContact,
  getAllContacts,
  updateContact,
  deleteContact,
} from '../Controllers/contactController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public
router.post('/', createContact);

// Admin
router.get('/', protect, admin, getAllContacts);
router.put('/:id', protect, admin, updateContact);
router.delete('/:id', protect, admin, deleteContact);

export default router;
