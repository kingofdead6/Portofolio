import asyncHandler from 'express-async-handler';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Upload a single image and return { url, public_id } (admin)
// @route   POST /api/upload   (multipart field: "image")
// Used for skill-item icons, which live embedded inside a SkillGroup — the
// admin uploads here, then saves the returned image object with the group.
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    res.status(400);
    throw new Error('No image file provided');
  }
  const folder = req.body.folder || 'portfolio/skills';
  const uploaded = await uploadToCloudinary(req.files.image, folder);
  res.status(201).json(uploaded);
});

// @desc    Delete an image by public_id (admin)
// @route   DELETE /api/upload   body: { public_id }
export const removeImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) {
    res.status(400);
    throw new Error('public_id is required');
  }
  await deleteFromCloudinary(public_id);
  res.json({ success: true });
});
