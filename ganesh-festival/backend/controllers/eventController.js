// controllers/eventController.js - Event Management
const pool = require('../config/db');

/** GET /api/events - Get all events */
const getAllEvents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, m.name as mandal_name, u.name as created_by_name,
                    COUNT(er.id) as registered_count
             FROM events e
             LEFT JOIN mandals m ON e.mandal_id = m.id
             LEFT JOIN users u ON e.created_by = u.id
             LEFT JOIN event_registrations er ON er.event_id = e.id
             GROUP BY e.id, m.name, u.name
             ORDER BY e.event_date ASC`
        );
        res.json({ success: true, events: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
};

/** GET /api/events/:id - Get single event with participants */
const getEventById = async (req, res) => {
    try {
        const event = await pool.query(
            `SELECT e.*, m.name as mandal_name FROM events e
             LEFT JOIN mandals m ON e.mandal_id = m.id WHERE e.id = $1`,
            [req.params.id]
        );
        if (!event.rows[0]) return res.status(404).json({ success: false, message: 'Event not found.' });

        const registrations = await pool.query(
            `SELECT u.name, u.email FROM event_registrations er
             JOIN users u ON er.user_id = u.id WHERE er.event_id = $1`,
            [req.params.id]
        );

        res.json({ success: true, event: event.rows[0], participants: registrations.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch event.' });
    }
};

/** POST /api/events - Create event (Admin/Volunteer) */
const createEvent = async (req, res) => {
    const { mandal_id, title, type, description, event_date, location, max_participants } = req.body;
    if (!title || !event_date) {
        return res.status(400).json({ success: false, message: 'Title and event date are required.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [mandal_id, title, type, description, event_date, location, max_participants || 100, req.user.id]
        );
        res.status(201).json({ success: true, message: 'Event created!', event: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create event.' });
    }
};

/** PUT /api/events/:id - Update event */
const updateEvent = async (req, res) => {
    const { mandal_id, title, type, description, event_date, location, max_participants } = req.body;
    try {
        const result = await pool.query(
            `UPDATE events SET mandal_id=$1, title=$2, type=$3, description=$4,
             event_date=$5, location=$6, max_participants=$7 WHERE id=$8 RETURNING *`,
            [mandal_id, title, type, description, event_date, location, max_participants, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Event not found.' });
        res.json({ success: true, message: 'Event updated!', event: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
};

/** DELETE /api/events/:id - Delete event (Admin) */
const deleteEvent = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM events WHERE id=$1 RETURNING id', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Event not found.' });
        res.json({ success: true, message: 'Event deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete event.' });
    }
};

/** POST /api/events/:id/register - Register for an event */
const registerForEvent = async (req, res) => {
    try {
        // Check capacity
        const event = await pool.query(
            `SELECT e.max_participants, COUNT(er.id) as count
             FROM events e LEFT JOIN event_registrations er ON er.event_id = e.id
             WHERE e.id = $1 GROUP BY e.id`,
            [req.params.id]
        );
        if (!event.rows[0]) return res.status(404).json({ success: false, message: 'Event not found.' });

        if (parseInt(event.rows[0].count) >= event.rows[0].max_participants) {
            return res.status(400).json({ success: false, message: 'Event is fully booked.' });
        }

        await pool.query(
            'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)',
            [req.params.id, req.user.id]
        );
        res.status(201).json({ success: true, message: 'Registered for event successfully!' });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
        }
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent };
