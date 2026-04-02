-- ============================================================
-- Migration: Add Darshan Passes + Online Donations
-- Run: psql -U postgres -d ganesh_festival_db -f backend/migrate.sql
-- ============================================================

-- Online Donations table (public-facing, no login required)
CREATE TABLE IF NOT EXISTS online_donations (
    id SERIAL PRIMARY KEY,
    donor_name    VARCHAR(150) NOT NULL,
    donor_email   VARCHAR(150) NOT NULL,
    donor_phone   VARCHAR(15),
    amount        DECIMAL(10,2) NOT NULL,
    mandal_id     INT REFERENCES mandals(id) ON DELETE SET NULL,
    purpose       VARCHAR(200) DEFAULT 'General Donation',
    payment_mode  VARCHAR(50)  DEFAULT 'upi',
    txn_id        VARCHAR(100),                        -- transaction reference
    message       TEXT,                                -- optional donor message
    status        VARCHAR(20)  DEFAULT 'completed'
                  CHECK (status IN ('pending','completed','failed')),
    donated_at    TIMESTAMP DEFAULT NOW()
);

-- Darshan Passes table
CREATE TABLE IF NOT EXISTS darshan_passes (
    id            SERIAL PRIMARY KEY,
    pass_number   VARCHAR(20) UNIQUE NOT NULL,         -- e.g. GFECS-2024-00001
    holder_name   VARCHAR(150) NOT NULL,
    holder_email  VARCHAR(150) NOT NULL,
    holder_phone  VARCHAR(15)  NOT NULL,
    mandal_id     INT REFERENCES mandals(id) ON DELETE SET NULL,
    pass_date     DATE NOT NULL,                       -- date of darshan
    pass_slot     VARCHAR(50)  NOT NULL,               -- Morning / Afternoon / Evening
    num_people    INT DEFAULT 1 CHECK (num_people BETWEEN 1 AND 10),
    status        VARCHAR(20)  DEFAULT 'active'
                  CHECK (status IN ('active','used','cancelled')),
    qr_data       TEXT,                                -- JSON string for QR display
    booked_by     INT REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_passes_email  ON darshan_passes(holder_email);
CREATE INDEX IF NOT EXISTS idx_passes_number ON darshan_passes(pass_number);
CREATE INDEX IF NOT EXISTS idx_passes_date   ON darshan_passes(pass_date);
CREATE INDEX IF NOT EXISTS idx_online_donations_email ON online_donations(donor_email);