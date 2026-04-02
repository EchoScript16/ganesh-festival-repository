// controllers/announcementController.js
const pool = require('../config/db');

const getAllAnnouncements = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.name as posted_by_name FROM announcements a
             LEFT JOIN users u ON a.posted_by = u.id
             ORDER BY a.created_at DESC`
        );
        res.json({ success: true, announcements: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }
};

const createAnnouncement = async (req, res) => {
    const { title, content, priority } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO announcements (title, content, priority, posted_by)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [title, content, priority || 'normal', req.user.id]
        );
        res.status(201).json({ success: true, message: 'Announcement posted!', announcement: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to post announcement.' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        await pool.query('DELETE FROM announcements WHERE id=$1', [req.params.id]);
        res.json({ success: true, message: 'Announcement deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete.' });
    }
};

module.exports = { getAllAnnouncements, createAnnouncement, deleteAnnouncement };
