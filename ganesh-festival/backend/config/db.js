// config/db.js — Render Internal DB Connection

const { Pool } = require('pg');

// Check env variable
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // ❗ NO SSL for internal connection
    ssl: false,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection with retry
const connectDB = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ DB connected:', res.rows[0].now);
    } catch (err) {
        console.error('❌ DB connection failed:', err.message);
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Handle pool errors
pool.on('error', (err) => {
    console.error('❌ Unexpected DB error:', err.message);
});

module.exports = pool;