const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
    getAllMandals,
    getMandalById,
    createMandal,
    updateMandal,
    deleteMandal
} = require('../controllers/mandalController');

const { authenticate, authorize } = require('../middleware/auth');

// ── Multer Setup (Image Upload) ───────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/mandals');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ── Routes ───────────────────────────────────────────────────

// GET all mandals
router.get('/', getAllMandals);

// GET single mandal
router.get('/:id', getMandalById);

// CREATE mandal (WITH IMAGE)
router.post(
    '/',
    authenticate,
    authorize('admin'),
    upload.single('image'),   // ✅ IMPORTANT
    createMandal
);

// UPDATE mandal (WITH IMAGE)
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    upload.single('image'),   // ✅ IMPORTANT
    updateMandal
);

// DELETE mandal
router.delete('/:id', authenticate, authorize('admin'), deleteMandal);

module.exports = router;