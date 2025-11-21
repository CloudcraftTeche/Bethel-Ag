import { Request, Response } from 'express';
import User from '../models/User';
import { Event } from '../models/Event';
import { deleteFromCloudinary } from '../config/cloudinary';

export const uploadAvatarHandler = async (req: Request, res: Response) => {
  try {
    console.log('Upload avatar request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.userId;
    const avatarUrl = (req.file as any).path; 

    console.log('Avatar URL from Cloudinary:', avatarUrl);

    const user = await User.findById(userId);
    if (user?.avatar) {
      try {
        await deleteFromCloudinary(user.avatar);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: avatarUrl,
        user: updatedUser,
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

    const photoUrls = req.files.map((file: any) => file.path);

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

    const imageUrl = (req.file as any).path;
    const { eventId } = req.body;

    if (eventId) {
      const event = await Event.findById(eventId);
      if (event?.image) {
        try {
          await deleteFromCloudinary(event.image);
        } catch (error) {
          console.error('Failed to delete old event image:', error);
        }
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: { image: imageUrl } },
        { new: true }
      );

      if (!updatedEvent) {
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