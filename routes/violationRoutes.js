import express from 'express';
import { createViolation } from '../controllers/violationController.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Конфиг Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Настройка Multer с Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'violations',
    format: async () => 'jpg',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
const upload = multer({ storage });

// Обертка для передачи пути картинки в body (если есть)
const prepareImageUrl = (req, res, next) => {
  if (req.file && req.file.path) {
    req.body.imageUrl = req.file.path;
  }
  next();
};

// Применяем middleware
router.post('/', upload.single('image'), prepareImageUrl, createViolation);

export default router;
