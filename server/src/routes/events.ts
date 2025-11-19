
import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/:id', authenticate, getEvent);
router.get('/', authenticate, getEvents);
router.post('/', authenticate, isAdmin, createEvent);
router.put('/:id', authenticate, isAdmin, updateEvent);
router.delete('/:id', authenticate, isAdmin, deleteEvent);

export default router;