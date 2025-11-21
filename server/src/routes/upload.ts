import express from 'express';
import {
  uploadAvatar,
  uploadProfilePhotos,
  uploadEventImage,
} from '../config/cloudinary';
import { authenticate } from '../middleware/auth';
import {
  uploadAvatarHandler,
  uploadPhotosHandler,
  uploadEventImageHandler,
} from '../controllers/uploadController';

const router = express.Router();

router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  uploadAvatarHandler
);

router.post(
  '/photos',
  authenticate,
  uploadProfilePhotos.array('photos', 4),
  uploadPhotosHandler
);

router.post(
  '/event-image',
  authenticate,
  uploadEventImage.single('image'),
  uploadEventImageHandler
);

export default router;