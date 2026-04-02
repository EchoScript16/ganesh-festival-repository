// routes/volunteers.js
const express = require('express');
const router = express.Router();
const { getAllVolunteers, registerVolunteer, assignTask } = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllVolunteers);
router.post('/register', authenticate, registerVolunteer);
router.put('/:id/assign', authenticate, authorize('admin'), assignTask);

module.exports = router;
