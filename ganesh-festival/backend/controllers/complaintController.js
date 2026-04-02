// controllers/complaintController.js
const pool = require('../config/db');

const getAllComplaints = async (req, res) => {
    try {
        let query = `SELECT c.*, u.name as user_name, u.email as user_email,
                            a.name as resolved_by_name
                     FROM complaints c
                     LEFT JOIN users u ON c.user_id = u.id
                     LEFT JOIN users a ON c.resolved_by = a.id`;
        const params = [];
        // Non-admins only see their own complaints
        if (req.user.role !== 'admin') {
            query += ' WHERE c.user_id = $1';
            params.push(req.user.id);
        }
        query += ' ORDER BY c.created_at DESC';
        const result = await pool.query(query, params);
        res.json({ success: true, complaints: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
    }
};

const createComplaint = async (req, res) => {
    const { subject, description } = req.body;
    if (!subject || !description) {
        return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO complaints (user_id, subject, description) VALUES ($1,$2,$3) RETURNING *`,
            [req.user.id, subject, description]
        );
        res.status(201).json({ success: true, message: 'Complaint submitted!', complaint: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
    }
};

const resolveComplaint = async (req, res) => {
    const { status, admin_response } = req.body;
    try {
        const result = await pool.query(
            `UPDATE complaints SET status=$1, admin_response=$2, resolved_by=$3,
             resolved_at=CASE WHEN $1='resolved' THEN NOW() ELSE resolved_at END
             WHERE id=$4 RETURNING *`,
            [status, admin_response, req.user.id, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Complaint not found.' });
        res.json({ success: true, message: 'Complaint updated!', complaint: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update complaint.' });
    }
};

module.exports = { getAllComplaints, createComplaint, resolveComplaint };
