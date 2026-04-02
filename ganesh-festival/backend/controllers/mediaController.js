// controllers/mediaController.js - Media Gallery (Images/Videos)
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

const getAllMedia = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT med.*, m.name as mandal_name, u.name as uploaded_by_name
             FROM media med
             LEFT JOIN mandals m ON med.mandal_id = m.id
             LEFT JOIN users u ON med.uploaded_by = u.id
             ORDER BY med.uploaded_at DESC`
        );
        res.json({ success: true, media: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch media.' });
    }
};

const uploadMedia = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const { title, mandal_id, media_type } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    try {
        const result = await pool.query(
            `INSERT INTO media (title, file_name, file_path, media_type, mandal_id, uploaded_by)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [title, req.file.originalname, filePath, media_type || 'image', mandal_id, req.user.id]
        );
        res.status(201).json({ success: true, message: 'Media uploaded!', media: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to save media.' });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM media WHERE id=$1 RETURNING file_path', [req.params.id]);
        if (result.rows[0]) {
            // Try to delete the actual file
            const fullPath = path.join(__dirname, '..', result.rows[0].file_path);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        res.json({ success: true, message: 'Media deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete media.' });
    }
};

module.exports = { getAllMedia, uploadMedia, deleteMedia };
