// controllers/mandalController.js
const pool = require('../config/db');

/** GET ALL */
const getAllMandals = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*,
                   COUNT(DISTINCT e.id)  AS event_count,
                   COUNT(DISTINCT v.id)  AS volunteer_count
            FROM mandals m
            LEFT JOIN events e     ON e.mandal_id = m.id
            LEFT JOIN volunteers v ON v.mandal_id = m.id
            GROUP BY m.id
            ORDER BY m.id ASC
        `);

        res.json({ success: true, mandals: result.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch mandals.' });
    }
};

/** GET BY ID */
const getMandalById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*,
                   COUNT(DISTINCT e.id) AS event_count,
                   COUNT(DISTINCT v.id) AS volunteer_count
            FROM mandals m
            LEFT JOIN events e     ON e.mandal_id = m.id
            LEFT JOIN volunteers v ON v.mandal_id = m.id
            WHERE m.id = $1
            GROUP BY m.id
        `, [req.params.id]);

        if (!result.rows[0]) {
            return res.status(404).json({ success: false, message: 'Mandal not found.' });
        }

        res.json({ success: true, mandal: result.rows[0] });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch mandal.' });
    }
};

/** CREATE (WITH IMAGE UPLOAD) */
const createMandal = async (req, res) => {
    try {
        const { name, location, theme, description } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: 'Name and location are required.'
            });
        }

        // ✅ GET IMAGE FROM MULTER
        const imagePath = req.file
            ? `/uploads/mandals/${req.file.filename}`
            : null;

        const result = await pool.query(`
            INSERT INTO mandals (name, location, theme, description, image_url)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
        `, [
            name,
            location,
            theme || null,
            description || null,
            imagePath
        ]);

        res.status(201).json({
            success: true,
            message: 'Mandal created!',
            mandal: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create mandal.' });
    }
};

/** UPDATE (WITH IMAGE UPLOAD) */
const updateMandal = async (req, res) => {
    try {
        const { name, location, theme, description } = req.body;

        let imagePath = null;

        if (req.file) {
            imagePath = `/uploads/mandals/${req.file.filename}`;
        }

        const result = await pool.query(`
            UPDATE mandals
            SET name=$1,
                location=$2,
                theme=$3,
                description=$4,
                image_url = COALESCE($5, image_url)
            WHERE id=$6
            RETURNING *
        `, [
            name,
            location,
            theme || null,
            description || null,
            imagePath,
            req.params.id
        ]);

        if (!result.rows[0]) {
            return res.status(404).json({ success: false, message: 'Mandal not found.' });
        }

        res.json({
            success: true,
            message: 'Mandal updated!',
            mandal: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update mandal.' });
    }
};

/** DELETE */
const deleteMandal = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM mandals WHERE id=$1 RETURNING id',
            [req.params.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ success: false, message: 'Mandal not found.' });
        }

        res.json({ success: true, message: 'Mandal deleted.' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete mandal.' });
    }
};

module.exports = {
    getAllMandals,
    getMandalById,
    createMandal,
    updateMandal,
    deleteMandal
};