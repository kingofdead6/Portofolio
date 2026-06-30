import express from 'express';
import { recordVisit, getStats } from '../Controllers/statsController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public
router.post('/visit', recordVisit);

// Admin
router.get('/', protect, admin, getStats);

export default router;
