import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import authMiddleware from '../middlewares/authMiddleware.js';
import { deleteViolation, getViolations, createViolation, getMyViolations, getPublicViolations} from '../controllers/violationController.js';

const router = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'violations',
    format: async () => 'jpg',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
const upload = multer({ storage });

const prepareImageUrl = (req, res, next) => {
  if (req.file && req.file.path) {
    req.body.imageUrl = req.file.path;
  }
  next();
};

router.get('/', getViolations);
router.get('/all', getPublicViolations);
router.get('/me', authMiddleware, getMyViolations);
router.post(
  '/', 
  authMiddleware, 
  upload.single('image'), 
  prepareImageUrl, 
  createViolation
);
router.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
router.delete('/:id', authMiddleware, deleteViolation);
export default router;
