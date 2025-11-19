import express from 'express';
import { body } from 'express-validator';
import {
  getNotifications,
  getNotificationDetail,
  markAsRead,
  markAllAsRead,
  registerPushToken,
  sendNotification,
  sendBulkNotifications,
} from '../controllers/notificationController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/:id', authenticate, getNotificationDetail);
router.get('/', authenticate, getNotifications);

router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

router.post('/register-token', authenticate, registerPushToken);

router.post(
  '/send-single',
  authenticate,
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('type')
      .optional()
      .isIn(['meeting', 'message', 'reminder', 'update', 'general']),
  ],
  sendNotification
);

router.post(
  '/send-bulk',
  authenticate,
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('Recipients must be a non-empty array'),
    body('type')
      .optional()
      .isIn(['meeting', 'message', 'reminder', 'update', 'general']),
  ],
  sendBulkNotifications
);

export default router;