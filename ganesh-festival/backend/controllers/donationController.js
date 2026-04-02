// controllers/donationController.js
const pool = require('../config/db');

const getAllDonations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, m.name as mandal_name, u.name as recorded_by_name
             FROM donations d
             LEFT JOIN mandals m ON d.mandal_id = m.id
             LEFT JOIN users u ON d.recorded_by = u.id
             ORDER BY d.donated_at DESC`
        );
        // Summary stats
        const stats = await pool.query('SELECT SUM(amount) as total, COUNT(*) as count FROM donations');
        res.json({ success: true, donations: result.rows, stats: stats.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
};

const addDonation = async (req, res) => {
    const { donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode } = req.body;
    if (!donor_name || !amount) {
        return res.status(400).json({ success: false, message: 'Donor name and amount are required.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode || 'cash', req.user.id]
        );
        res.status(201).json({ success: true, message: 'Donation recorded!', donation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to record donation.' });
    }
};

const deleteDonation = async (req, res) => {
    try {
        await pool.query('DELETE FROM donations WHERE id=$1', [req.params.id]);
        res.json({ success: true, message: 'Donation record deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete.' });
    }
};

module.exports = { getAllDonations, addDonation, deleteDonation };
