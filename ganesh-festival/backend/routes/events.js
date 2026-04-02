// routes/events.js
const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('admin'), createEvent);
router.put('/:id', authenticate, authorize('admin'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);
router.post('/:id/register', authenticate, registerForEvent);

module.exports = router;