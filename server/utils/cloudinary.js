import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a file buffer to Cloudinary and returns { url, public_id } so we can
// later delete the old asset when an image is replaced.
export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  if (!file) return null;
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp', 'avif'],
        public_id: `img_${Date.now()}`,
      },
      (error, res) => (error ? reject(error) : resolve(res))
    );
    stream.end(file.data || file.buffer);
  });
  return { url: result.secure_url, public_id: result.public_id };
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return null;
  }
};
