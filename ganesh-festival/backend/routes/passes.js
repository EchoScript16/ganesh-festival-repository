// routes/passes.js
const express = require('express');
const router = express.Router();
const { bookPass, getAllPasses, lookupPass, updatePassStatus } = require('../controllers/passController');
const { authenticate, authorize } = require('../middleware/auth');

// Optional auth middleware — attaches user if token present, continues either way
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        try {
            req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        } catch(e) { /* invalid token, continue as guest */ }
    }
    next();
};

router.get('/lookup', lookupPass);                              // Public — look up by email/pass_number
router.post('/', optionalAuth, bookPass);                       // Public — anyone can book
router.get('/', authenticate, authorize('admin'), getAllPasses); // Admin — see all passes
router.put('/:id/status', authenticate, authorize('admin'), updatePassStatus); // Admin — update status

module.exports = router;