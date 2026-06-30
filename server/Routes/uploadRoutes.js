import express from 'express';
import { uploadImage, removeImage } from '../Controllers/uploadController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, uploadImage);
router.delete('/', protect, admin, removeImage);

export default router;
