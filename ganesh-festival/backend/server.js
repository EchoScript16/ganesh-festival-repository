require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Ensure uploads folders exist ──────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
const mandalUploads = path.join(uploadsDir, 'mandals');

if (!fs.existsSync(mandalUploads)) {
    fs.mkdirSync(mandalUploads, { recursive: true });
}

// ── Static Files ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mandals', require('./routes/mandals'));
app.use('/api/events', require('./routes/events'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/online-donations', require('./routes/onlineDonations'));
app.use('/api/passes', require('./routes/passes'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/media', require('./routes/media'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🎉 Ganesh Festival API is running!',
        timestamp: new Date()
    });
});

// ── Catch-all ────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ── Start server AFTER DB connection ──────────────────────────
pool.connect()
    .then(() => {
        console.log("✅ Database connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });