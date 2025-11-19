import express from 'express';
import {
  uploadAvatar,
  uploadProfilePhotos,
  uploadEventImage,
} from '../config/cloudinary';
import { authenticate } from '../middleware/auth';
import { uploadAvatarHandler, uploadPhotosHandler, uploadEventImageHandler } from '../controllers/uploadController';

const router = express.Router();

router.post('/avatar', authenticate, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadAvatarHandler);

router.post('/photos', authenticate, (req, res, next) => {
  uploadProfilePhotos(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadPhotosHandler);

router.post('/event-image', authenticate, (req, res, next) => {
  uploadEventImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadEventImageHandler);

export default router;