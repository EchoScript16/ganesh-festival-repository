// controllers/onlineDonationController.js
// Public-facing donations — no login required to donate
const pool = require('../config/db');

/** GET /api/online-donations — Admin sees all, public sees stats only */
const getAllOnlineDonations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT od.*, m.name as mandal_name
             FROM online_donations od
             LEFT JOIN mandals m ON od.mandal_id = m.id
             ORDER BY od.donated_at DESC`
        );
        const stats = await pool.query(
            `SELECT SUM(amount) as total, COUNT(*) as count FROM online_donations WHERE status='completed'`
        );
        res.json({ success: true, donations: result.rows, stats: stats.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
};

/** POST /api/online-donations — Anyone can donate (no auth) */
const submitOnlineDonation = async (req, res) => {
    const { donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, txn_id, message } = req.body;

    if (!donor_name || !donor_email || !amount) {
        return res.status(400).json({ success: false, message: 'Name, email and amount are required.' });
    }
    if (parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO online_donations
             (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, txn_id, message)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [donor_name, donor_email, donor_phone, parseFloat(amount),
             mandal_id || null, purpose || 'General Donation',
             payment_mode || 'upi', txn_id || null, message || null]
        );

        res.status(201).json({
            success: true,
            message: `Thank you ${donor_name}! Your donation of ₹${amount} has been recorded. 🙏`,
            donation: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to record donation.' });
    }
};

/** GET /api/online-donations/stats — Public summary stats */
const getDonationStats = async (req, res) => {
    try {
        const stats = await pool.query(
            `SELECT SUM(amount) as total, COUNT(*) as count,
                    MAX(amount) as highest, AVG(amount) as average
             FROM online_donations WHERE status='completed'`
        );
        const topDonors = await pool.query(
            `SELECT donor_name, SUM(amount) as total_donated
             FROM online_donations WHERE status='completed'
             GROUP BY donor_name ORDER BY total_donated DESC LIMIT 5`
        );
        res.json({ success: true, stats: stats.rows[0], topDonors: topDonors.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
};

module.exports = { getAllOnlineDonations, submitOnlineDonation, getDonationStats };