// controllers/volunteerController.js
const pool = require('../config/db');

const getAllVolunteers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.*, u.name, u.email, u.phone, m.name as mandal_name
             FROM volunteers v
             JOIN users u ON v.user_id = u.id
             LEFT JOIN mandals m ON v.mandal_id = m.id
             ORDER BY v.joined_at DESC`
        );
        res.json({ success: true, volunteers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch volunteers.' });
    }
};

const registerVolunteer = async (req, res) => {
    const { mandal_id, skills, availability } = req.body;
    try {
        // Check if already registered
        const existing = await pool.query('SELECT id FROM volunteers WHERE user_id=$1', [req.user.id]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'You are already registered as a volunteer.' });
        }
        const result = await pool.query(
            `INSERT INTO volunteers (user_id, mandal_id, skills, availability)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [req.user.id, mandal_id, skills, availability]
        );
        // Update user role to volunteer
        await pool.query("UPDATE users SET role='volunteer' WHERE id=$1", [req.user.id]);
        res.status(201).json({ success: true, message: 'Volunteer registered successfully!', volunteer: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to register volunteer.' });
    }
};

const assignTask = async (req, res) => {
    const { assigned_task, shift } = req.body;
    try {
        const result = await pool.query(
            `UPDATE volunteers SET assigned_task=$1, shift=$2 WHERE id=$3 RETURNING *`,
            [assigned_task, shift, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Volunteer not found.' });
        res.json({ success: true, message: 'Task assigned!', volunteer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to assign task.' });
    }
};

module.exports = { getAllVolunteers, registerVolunteer, assignTask };
