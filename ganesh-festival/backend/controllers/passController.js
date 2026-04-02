// controllers/passController.js — Darshan Pass Booking System
const pool = require('../config/db');

/** Generate unique pass number like GFECS-2024-00042 */
async function generatePassNumber() {
    const year = new Date().getFullYear();
    const result = await pool.query('SELECT COUNT(*) FROM darshan_passes');
    const seq = String(parseInt(result.rows[0].count) + 1).padStart(5, '0');
    return `GFECS-${year}-${seq}`;
}

/** POST /api/passes — Book a darshan pass (login optional but saves user_id) */
const bookPass = async (req, res) => {
    const { holder_name, holder_email, holder_phone, mandal_id, pass_date, pass_slot, num_people } = req.body;

    if (!holder_name || !holder_email || !holder_phone || !mandal_id || !pass_date || !pass_slot) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (new Date(pass_date) < new Date().setHours(0,0,0,0)) {
        return res.status(400).json({ success: false, message: 'Pass date cannot be in the past.' });
    }

    try {
        // Check slot capacity (max 200 people per slot per mandal per day)
        const capacity = await pool.query(
            `SELECT COALESCE(SUM(num_people),0) as booked
             FROM darshan_passes
             WHERE mandal_id=$1 AND pass_date=$2 AND pass_slot=$3 AND status != 'cancelled'`,
            [mandal_id, pass_date, pass_slot]
        );
        const booked = parseInt(capacity.rows[0].booked);
        const MAX_PER_SLOT = 200;
        if (booked + parseInt(num_people || 1) > MAX_PER_SLOT) {
            return res.status(400).json({
                success: false,
                message: `Sorry! This slot is almost full. Only ${MAX_PER_SLOT - booked} spots remaining.`
            });
        }

        const passNumber = await generatePassNumber();

        // Build QR data (JSON string to display as pass info)
        const qrData = JSON.stringify({
            pass:    passNumber,
            name:    holder_name,
            date:    pass_date,
            slot:    pass_slot,
            mandal:  mandal_id,
            people:  num_people || 1
        });

        const result = await pool.query(
            `INSERT INTO darshan_passes
             (pass_number, holder_name, holder_email, holder_phone, mandal_id, pass_date, pass_slot, num_people, qr_data, booked_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [passNumber, holder_name, holder_email, holder_phone,
             mandal_id, pass_date, pass_slot, num_people || 1,
             qrData, req.user?.id || null]
        );

        res.status(201).json({
            success: true,
            message: `🎉 Darshan Pass booked! Your pass number is ${passNumber}`,
            pass: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to book pass.' });
    }
};

/** GET /api/passes — Admin sees all passes */
const getAllPasses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT dp.*, m.name as mandal_name
             FROM darshan_passes dp
             LEFT JOIN mandals m ON dp.mandal_id = m.id
             ORDER BY dp.created_at DESC`
        );
        const stats = await pool.query(
            `SELECT COUNT(*) as total,
                    SUM(num_people) as total_people,
                    COUNT(CASE WHEN status='active' THEN 1 END) as active,
                    COUNT(CASE WHEN status='used' THEN 1 END) as used,
                    COUNT(CASE WHEN status='cancelled' THEN 1 END) as cancelled
             FROM darshan_passes`
        );
        res.json({ success: true, passes: result.rows, stats: stats.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch passes.' });
    }
};

/** GET /api/passes/lookup?email=x — Look up passes by email (public) */
const lookupPass = async (req, res) => {
    const { email, pass_number } = req.query;
    if (!email && !pass_number) {
        return res.status(400).json({ success: false, message: 'Provide email or pass number.' });
    }
    try {
        let query = `SELECT dp.*, m.name as mandal_name FROM darshan_passes dp
                     LEFT JOIN mandals m ON dp.mandal_id = m.id WHERE `;
        const params = [];
        if (pass_number) {
            query += 'dp.pass_number = $1';
            params.push(pass_number.toUpperCase());
        } else {
            query += 'dp.holder_email = $1';
            params.push(email);
        }
        query += ' ORDER BY dp.created_at DESC';

        const result = await pool.query(query, params);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'No passes found.' });
        }
        res.json({ success: true, passes: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lookup failed.' });
    }
};

/** PUT /api/passes/:id/status — Admin updates pass status */
const updatePassStatus = async (req, res) => {
    const { status } = req.body;
    if (!['active','used','cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    try {
        const result = await pool.query(
            'UPDATE darshan_passes SET status=$1 WHERE id=$2 RETURNING *',
            [status, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Pass not found.' });
        res.json({ success: true, message: `Pass marked as ${status}.`, pass: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update pass.' });
    }
};

module.exports = { bookPass, getAllPasses, lookupPass, updatePassStatus };