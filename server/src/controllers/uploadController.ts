import { Request, Response } from 'express';
import User from '../models/User';
import { Event } from '@/models/Event';


export const uploadAvatarHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.userId;
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: avatarUrl,
        user: user,
      },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

export const uploadPhotosHandler = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photoUrls = req.files.map((file: Express.Multer.File) => file.path);

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        urls: photoUrls,
      },
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
};

export const uploadEventImageHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = req.file.path;
    const { eventId } = req.body;

    if (eventId) {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $set: { image: imageUrl } },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
    }

    res.json({
      success: true,
      message: 'Event image uploaded successfully',
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    console.error('Upload event image error:', error);
    res.status(500).json({ error: 'Failed to upload event image' });
  }
};

