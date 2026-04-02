// routes/donations.js
const express = require('express');
const router = express.Router();
const { getAllDonations, addDonation, deleteDonation } = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllDonations);
router.post('/', authenticate, authorize('admin', 'volunteer'), addDonation);
router.delete('/:id', authenticate, authorize('admin'), deleteDonation);

module.exports = router;
