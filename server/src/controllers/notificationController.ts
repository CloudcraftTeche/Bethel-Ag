import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { sendPushNotification } from '../utils/pushNotifications';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotificationDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    res.json(notification);
  } catch (error: any) {
    console.error('Get notification detail error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const { token, deviceId } = req.body;
    const userId = (req as any).user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushTokens = user.pushTokens?.filter((t) => t.deviceId !== deviceId) || [];
    user.pushTokens.push({ token, deviceId });
    await user.save();

    res.json({ success: true, message: 'Push token registered' });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, userId, data } = req.body;

    const notification = new Notification({
      title,
      message,
      type: type || 'general',
      userId,
      data,
      read: false,
    });

    await notification.save();

    const user = await User.findById(userId);
    if (user && user.pushTokens && user.pushTokens.length > 0) {
      const tokens = user.pushTokens.map((t) => t.token);
      await sendPushNotification(tokens, title, message, data);
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendBulkNotifications = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, recipients, data } = req.body;

    const notifications = recipients.map((userId: string) => ({
      title,
      message,
      type: type || 'general',
      userId,
      data,
      read: false,
    }));

    await Notification.insertMany(notifications);

    const users = await User.find({ _id: { $in: recipients } });
    const allTokens: string[] = [];

    users.forEach((user) => {
      if (user.pushTokens && user.pushTokens.length > 0) {
        user.pushTokens.forEach((t) => allTokens.push(t.token));
      }
    });

    if (allTokens.length > 0) {
      await sendPushNotification(allTokens, title, message, data);
    }

    res.json({
      success: true,
      message: `Notification sent to ${recipients.length} users`,
      count: recipients.length,
    });
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};