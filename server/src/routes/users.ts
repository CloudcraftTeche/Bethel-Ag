import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/:id', authenticate, isAdmin, getUserById);
router.put('/:id', authenticate, isAdmin, updateUser);
router.delete('/:id', authenticate, isAdmin, deleteUser);

export default router;