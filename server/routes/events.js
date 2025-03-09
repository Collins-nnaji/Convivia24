const express = require('express');
const {
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  cancelAttendance
} = require('../controllers/events');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/:id/attend', protect, attendEvent);
router.put('/:id/cancel', protect, cancelAttendance);

module.exports = router; 