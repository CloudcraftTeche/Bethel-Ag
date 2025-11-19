import { Request, Response } from 'express';
import User from '../models/User';

export const getContacts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { nickname: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const contacts = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await User.findById(id).select('-password');
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      nickname,
      role,
      mobile,
      alternateMobile,
      address,
      spouse,
      children,
      nativePlace,
      church,
      avatar,
    } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      nickname,
      role: role || 'user',
      mobile,
      alternateMobile,
      address,
      spouse,
      children,
      nativePlace,
      church,
      avatar,
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData.password) {
      delete updateData.password;
    }

    const contact = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await User.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};