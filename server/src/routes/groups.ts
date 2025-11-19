
import express from 'express';
import {
  getGroups,
  getGroup,
  getGroupMembers,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, isAdmin, createGroup);
router.get('/', authenticate, getGroups);
router.get('/:id/members', authenticate, getGroupMembers);
router.get('/:id', authenticate, getGroup);
router.put('/:id', authenticate, isAdmin, updateGroup);
router.delete('/:id', authenticate, isAdmin, deleteGroup);

export default router;