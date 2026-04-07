// config/db.js - PostgreSQL Connection Pool (Supabase Ready)

const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL from environment (Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully');
        release();
    }
});

pool.query('SELECT NOW()')
  .then(res => console.log("✅ DB Connected:", res.rows))
  .catch(err => console.error("❌ DB Error:", err.message));


module.exports = pool;