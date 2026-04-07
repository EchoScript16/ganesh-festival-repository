// config/db.js - PostgreSQL Connection Pool
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool for efficient DB access
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ganesh_festival_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'PASSWORD',
    max: 20,                  // Max pool connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, done) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully');
        done();
    }
});

module.exports = pool;