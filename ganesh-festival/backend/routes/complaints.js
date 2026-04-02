// routes/complaints.js
const express = require('express');
const router = express.Router();
const { getAllComplaints, createComplaint, resolveComplaint } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllComplaints);
router.post('/', authenticate, createComplaint);
router.put('/:id/resolve', authenticate, authorize('admin'), resolveComplaint);

module.exports = router;
