-- ============================================================
-- Ganesh Festival ECS — Full Database Schema
-- Run: psql -U postgres -d ganesh_festival_db -f backend/schema.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'volunteer', 'user')),
    phone      VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mandals table (image_url included)
CREATE TABLE IF NOT EXISTS mandals (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    location    VARCHAR(200) NOT NULL,
    theme       VARCHAR(100),
    description TEXT,
    image_url   VARCHAR(500),
    created_by  INT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id               SERIAL PRIMARY KEY,
    mandal_id        INT REFERENCES mandals(id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    type             VARCHAR(50) CHECK (type IN ('aarti', 'competition', 'cultural', 'other')),
    description      TEXT,
    event_date       TIMESTAMP NOT NULL,
    location         VARCHAR(200),
    max_participants INT DEFAULT 100,
    created_by       INT REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id            SERIAL PRIMARY KEY,
    event_id      INT REFERENCES events(id) ON DELETE CASCADE,
    user_id       INT REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id           SERIAL PRIMARY KEY,
    donor_name   VARCHAR(150) NOT NULL,
    donor_email  VARCHAR(150),
    donor_phone  VARCHAR(15),
    amount       DECIMAL(10,2) NOT NULL,
    mandal_id    INT REFERENCES mandals(id) ON DELETE SET NULL,
    purpose      VARCHAR(200),
    payment_mode VARCHAR(50) DEFAULT 'cash',
    recorded_by  INT REFERENCES users(id) ON DELETE SET NULL,
    donated_at   TIMESTAMP DEFAULT NOW()
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
    id            SERIAL PRIMARY KEY,
    user_id       INT REFERENCES users(id) ON DELETE CASCADE,
    mandal_id     INT REFERENCES mandals(id) ON DELETE SET NULL,
    skills        TEXT,
    availability  VARCHAR(100),
    assigned_task TEXT,
    shift         VARCHAR(50),
    status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    joined_at     TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id             SERIAL PRIMARY KEY,
    user_id        INT REFERENCES users(id) ON DELETE SET NULL,
    subject        VARCHAR(200) NOT NULL,
    description    TEXT NOT NULL,
    status         VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_response TEXT,
    resolved_by    INT REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMP DEFAULT NOW(),
    resolved_at    TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    content    TEXT NOT NULL,
    priority   VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    posted_by  INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Media gallery table
CREATE TABLE IF NOT EXISTS media (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200),
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    media_type  VARCHAR(10) CHECK (media_type IN ('image', 'video')),
    mandal_id   INT REFERENCES mandals(id) ON DELETE SET NULL,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Darshan Passes table
CREATE TABLE IF NOT EXISTS passes (
    id           SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(id) ON DELETE SET NULL,
    pass_code    VARCHAR(20) UNIQUE NOT NULL,
    holder_name  VARCHAR(150) NOT NULL,
    holder_phone VARCHAR(15) NOT NULL,
    holder_email VARCHAR(150),
    persons      INT DEFAULT 1 CHECK (persons BETWEEN 1 AND 5),
    mandal_id    INT REFERENCES mandals(id) ON DELETE SET NULL,
    pass_type    VARCHAR(20) DEFAULT 'general' CHECK (pass_type IN ('general', 'priority', 'vip')),
    darshan_date DATE NOT NULL,
    time_slot    VARCHAR(20) NOT NULL,
    status       VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
    used_at      TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- If upgrading an EXISTING database, run:
--   ALTER TABLE mandals ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
-- ============================================================

-- ============================================================
-- Seed Data  (safe to re-run — uses ON CONFLICT DO NOTHING)
-- ============================================================

INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User',  'admin@ganeshfest.com', '$2b$10$rQnm2PVxmLhDrqHNPUBHfOq1YdNZ3ByQ4VnqEkW6u0pX9mZ0fQS2e', 'admin',    '9876543210'),
('Rahul Sharma','rahul@example.com',   '$2b$10$rQnm2PVxmLhDrqHNPUBHfOq1YdNZ3ByQ4VnqEkW6u0pX9mZ0fQS2e', 'volunteer', '9876543211'),
('Priya Patel', 'priya@example.com',   '$2b$10$rQnm2PVxmLhDrqHNPUBHfOq1YdNZ3ByQ4VnqEkW6u0pX9mZ0fQS2e', 'user',      '9876543212')
ON CONFLICT (email) DO NOTHING;

-- ── 7 Correct Pune Ganesh Mandals ────────────────────────────────
INSERT INTO mandals (name, location, theme, description, image_url, created_by) VALUES

('Kasba Ganapati Mandal',
 'Kasba Peth, Pune – 411011',
 'Gramdaivat of Pune',
 'Kasba Ganapati is the Gramdaivat (village deity) of Pune, installed in 1636 by Jijabai — mother of Chhatrapati Shivaji Maharaj. It holds the honorary first position (Prathamesh) among all Panchanga mandals and is visited by lakhs of devotees during the 10-day festival.',
 '/images/mandals/kasaba.jpg', 1),

('Shrimant Dagdusheth Halwai Ganapati',
 'Budhwar Peth, Pune – 411002',
 'Gold-adorned Deity',
 'One of the most visited and iconic Ganapati mandals in Pune, established in 1893 by Seth Dagdusheth Halwai. The idol is lavishly decorated with pure gold ornaments and precious jewellery. The Dagdusheth Halwai Trust actively runs social welfare, education, and health initiatives throughout the year.',
 '/images/mandals/dagdusheth.jpg', 1),

('Tambdi Jogeshwari Mandal',
 'Budhwar Peth, Pune – 411002',
 'Oldest Sarvajanik Mandal',
 'Established in 1893 at the call of Lokmanya Bal Gangadhar Tilak, Tambdi Jogeshwari is counted among the very first Sarvajanik Ganeshotsav mandals in Pune. It is famed for its century-old traditions, classical music events, and deep community participation.',
 '/images/mandals/tambdi.jpg', 1),

('Guruji Talim Mandal',
 'Shukrawar Peth, Pune – 411002',
 'Wrestlers'' Tradition',
 'Guruji Talim Ganesh Mandal carries the proud legacy of Pune''s wrestling (talim) culture. Known for its massive, artistically crafted Ganesha idol, the mandal also promotes physical fitness and Maharashtrian martial traditions during the festival.',
 '/images/mandals/guruji-talim.jpg', 1),

('Kesariwada Mandal',
 'Narayan Peth, Pune – 411030',
 'Birthplace of Sarvajanik Ganeshotsav',
 'Kesariwada is the historic residence of Lokmanya Bal Gangadhar Tilak — the very place where Sarvajanik Ganeshotsav was publicly launched in 1893 as a platform to unite Indians against British rule. Celebrating here is a tribute to freedom fighters and national heritage.',
 '/images/mandals/kesariwada.jpg', 1),

('Tulshibaug Mandal',
 'Tulshibaug, Pune – 411002',
 'Temple-inspired Grandeur',
 'Tulshibaug Ganesh Mandal is celebrated for its magnificent pandals inspired by famous temples and monuments of India. The mandal is known for intricate decorations, classical music performances, and strong community involvement that draws lakhs of devotees every year.',
 '/images/mandals/tulshibag.jpg', 1),

('Bhausaheb Rangari Mandal',
 'Raviwar Peth, Pune – 411002',
 'Second Manacha Mandal',
 'Bhausaheb Rangari Ganesh Mandal holds the prestigious second position among Pune''s Panchanga (five honoured) Mandals. Founded in 1893, it is famed for its towering idol, elaborate pandal decorations, and the grand Anant Chaturdashi visarjan procession that draws hundreds of thousands.',
 '/images/mandals/bhausaheb-rangari.jpg', 1)

ON CONFLICT DO NOTHING;

-- ── Events ───────────────────────────────────────────────────────
INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Morning Aarti Ceremony', 'aarti',
       'Grand morning aarti with dhol-tasha music and traditional prayers. Open to all devotees.',
       NOW() + INTERVAL '3 days', m.location, 500, 1
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Rangoli Competition', 'competition',
       'Inter-colony rangoli competition with exciting prizes. Theme: Ganesh Utsav 2026.',
       NOW() + INTERVAL '4 days', 'Kasba Peth Ground', 100, 1
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Bhajan & Kirtan Night', 'cultural',
       'A divine evening of devotional bhajans and kirtans in the presence of Dagdusheth Ganapati.',
       NOW() + INTERVAL '5 days', 'Budhwar Peth Mandal', 600, 1
FROM mandals m WHERE m.name = 'Shrimant Dagdusheth Halwai Ganapati';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Kushti (Wrestling) Championship', 'competition',
       'Traditional Maharashtrian wrestling competition honouring the proud talim legacy of Pune.',
       NOW() + INTERVAL '6 days', 'Shukrawar Peth Akhada', 200, 1
FROM mandals m WHERE m.name = 'Guruji Talim Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Swatantryaveer Lecture Series', 'cultural',
       'Talks and cultural shows honouring India''s freedom fighters and Lokmanya Tilak''s legacy.',
       NOW() + INTERVAL '7 days', 'Kesariwada Hall', 300, 1
FROM mandals m WHERE m.name = 'Kesariwada Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Temple Pandal Exhibition', 'cultural',
       'A walkthrough of the famous temple-replica pandal with guided explanations. All welcome.',
       NOW() + INTERVAL '8 days', 'Tulshibaug Mandal', 500, 1
FROM mandals m WHERE m.name = 'Tulshibaug Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Grand Visarjan Procession', 'cultural',
       'The magnificent Anant Chaturdashi farewell procession. Join lakhs of devotees on the streets of Pune!',
       NOW() + INTERVAL '10 days', 'Pune City Route', 10000, 1
FROM mandals m WHERE m.name = 'Bhausaheb Rangari Mandal';

-- ── Donations ─────────────────────────────────────────────────────
INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Suresh Joshi','suresh@example.com','9800001111', 5000.00, m.id,'Decoration Fund','upi',1
FROM mandals m WHERE m.name='Kasba Ganapati Mandal';

INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Meena Kulkarni','meena@example.com','9800002222', 2500.00, m.id,'Event Expenses','cash',1
FROM mandals m WHERE m.name='Shrimant Dagdusheth Halwai Ganapati';

INSERT INTO donations (donor_name, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Vikram Singh','9800003333', 10000.00, m.id,'General Donation','bank_transfer',1
FROM mandals m WHERE m.name='Bhausaheb Rangari Mandal';

INSERT INTO donations (donor_name, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Anita Desai','9800004444', 1000.00, m.id,'Prasad Fund','cash',1
FROM mandals m WHERE m.name='Guruji Talim Mandal';

-- ── Volunteer ─────────────────────────────────────────────────────
INSERT INTO volunteers (user_id, mandal_id, skills, availability)
SELECT 2, m.id, 'Photography, Event Management, Sound Systems', 'Full Day'
FROM mandals m WHERE m.name='Kasba Ganapati Mandal'
ON CONFLICT DO NOTHING;

-- ── Announcements ─────────────────────────────────────────────────
INSERT INTO announcements (title, content, priority, posted_by) VALUES
('Festival Schedule 2026 Released',
 'The complete 10-day schedule for all Pune mandals is now live on the Events page!',
 'high', 1),
('Darshan Pass System Launched',
 'Book your Darshan pass online and skip the queue! Priority and VIP slots available at all mandals.',
 'urgent', 1),
('Volunteer Registration Open',
 'Join our team for Ganesh Utsav 2026. Register as a volunteer and contribute to the celebration!',
 'normal', 1),
('Eco-Friendly Ganeshotsav Drive',
 'All mandals are joining our 100% eco-friendly drive this year. Avoid plastic, use cloth bags.',
 'high', 1)
ON CONFLICT DO NOTHING;

-- ── Complaints ────────────────────────────────────────────────────
INSERT INTO complaints (user_id, subject, description, status) VALUES
(3, 'Parking near Kasba Peth',     'Need better parking arrangements near Kasba Ganapati Mandal.', 'pending'),
(2, 'Sound System After Midnight', 'Loud music after midnight disturbs nearby residents.',           'in_progress')
ON CONFLICT DO NOTHING;