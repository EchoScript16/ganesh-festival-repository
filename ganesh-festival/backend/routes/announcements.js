// routes/announcements.js
const express = require('express');
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getAllAnnouncements);
router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

module.exports = router;
