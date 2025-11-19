import { Group } from '../models/Group';
import { Request, Response } from 'express';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let query: any = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const groups = await Group.find(query)
      .populate('members', 'name email nickname avatar')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate('members', 'name email nickname avatar')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    const group = await Group.findById(id).populate({
      path: 'members',
      select: 'name email avatar role status _id',
      model: 'User'
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const membersWithDetails = group.members.map((member: any) => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      avatar: member.avatar,
      role: member.role || 'member',
      status: member.status || 'active',
    }));

    res.json(membersWithDetails);
  } catch (error: any) {
    console.error('Get group members error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid group ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, members } = req.body;
    const userId = (req as any).user.userId;

    const group = new Group({
      name,
      members,
      createdBy: userId,
    });

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email nickname avatar')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, members } = req.body;

    const group = await Group.findByIdAndUpdate(
      id,
      { $set: { name, members } },
      { new: true, runValidators: true }
    )
      .populate('members', 'name email nickname avatar')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await Group.findByIdAndDelete(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};