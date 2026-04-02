// routes/onlineDonations.js
const express = require('express');
const router = express.Router();
const { getAllOnlineDonations, submitOnlineDonation, getDonationStats } = require('../controllers/onlineDonationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', getDonationStats);                              // Public stats
router.get('/', authenticate, authorize('admin'), getAllOnlineDonations); // Admin only
router.post('/', submitOnlineDonation);                              // No auth - anyone can donate

module.exports = router;