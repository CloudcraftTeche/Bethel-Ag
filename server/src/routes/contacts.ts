
import express from 'express';
import {
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController';
import { authenticate, isAdmin } from '../middleware/auth';
import { register } from '../controllers/authController';

const router = express.Router();

router.get('/', authenticate, getContacts);
router.get('/:id', authenticate, getContact);
router.post('/', authenticate, isAdmin, register);
router.put('/:id', authenticate, isAdmin, updateContact);
router.delete('/:id', authenticate, isAdmin, deleteContact);

export default router;

