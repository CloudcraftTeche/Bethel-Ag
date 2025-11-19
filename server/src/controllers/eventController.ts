
import { Event } from '../models/Event';
import { Request, Response } from 'express';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const now = new Date();
    let query: any = {};
    
    if (type === 'upcoming') {
      query = { date: { $gte: now } };
    } else if (type === 'past') {
      query = { date: { $lt: now } };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: type === 'past' ? -1 : 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, time, location, image } = req.body;
    const userId = (req as any).user.userId;

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      image,
      createdBy: userId,
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};