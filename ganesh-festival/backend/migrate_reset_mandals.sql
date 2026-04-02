-- ============================================================
-- FIXED RESET MIGRATION — Fixes duplicate/wrong mandals
-- Run: psql -U postgres -d ganesh_festival_db -f backend/migrate_reset_mandals.sql
-- ============================================================

-- Step 1: Add image_url to mandals if missing
ALTER TABLE mandals ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Step 2: Create passes table FIRST (was missing — caused the original error)
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

-- Step 3: Clear all mandal-dependent data
DELETE FROM passes              WHERE mandal_id IS NOT NULL;
DELETE FROM event_registrations WHERE event_id IN (SELECT id FROM events WHERE mandal_id IS NOT NULL);
DELETE FROM events              WHERE mandal_id IS NOT NULL;
DELETE FROM volunteers          WHERE mandal_id IS NOT NULL;
DELETE FROM donations           WHERE mandal_id IS NOT NULL;
DELETE FROM media               WHERE mandal_id IS NOT NULL;

-- Step 4: Delete ALL mandals (removes all 14 duplicates)
DELETE FROM mandals;

-- Step 5: Reset sequence so IDs restart from 1
ALTER SEQUENCE mandals_id_seq RESTART WITH 1;

-- Step 6: Insert correct 7 Pune Ganesh Mandals
INSERT INTO mandals (name, location, theme, description, image_url, created_by) VALUES

('Kasba Ganapati Mandal',
 'Kasba Peth, Pune – 411011',
 'Gramdaivat of Pune',
 'Kasba Ganapati is the Gramdaivat (village deity) of Pune, installed in 1636 by Jijabai — mother of Chhatrapati Shivaji Maharaj. It holds the honorary first position (Prathamesh) among all Panchanga mandals.',
 '/images/mandals/kasaba.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Shrimant Dagdusheth Halwai Ganapati',
 'Budhwar Peth, Pune – 411002',
 'Gold-adorned Deity',
 'Established in 1893 by Seth Dagdusheth Halwai. The idol is lavishly decorated with pure gold ornaments. The Trust actively runs social welfare, education and health initiatives throughout the year.',
 '/images/mandals/dagdusheth.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Tambdi Jogeshwari Mandal',
 'Budhwar Peth, Pune – 411002',
 'Oldest Sarvajanik Mandal',
 'Founded in 1893 at Lokmanya Tilak''s call. One of the very first Sarvajanik Ganeshotsav mandals in Pune. Famed for its century-old traditions and classical music events.',
 '/images/mandals/tambdi.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Guruji Talim Mandal',
 'Shukrawar Peth, Pune – 411002',
 'Wrestlers'' Tradition',
 'Carries the proud legacy of Pune''s wrestling (talim) culture. Known for its massive artistically crafted Ganesha idol and promotion of Maharashtrian martial traditions.',
 '/images/mandals/guruji-talim.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Kesariwada Mandal',
 'Narayan Peth, Pune – 411030',
 'Birthplace of Sarvajanik Ganeshotsav',
 'Historic residence of Lokmanya Tilak where Sarvajanik Ganeshotsav was publicly launched in 1893 to unite Indians against British rule. A tribute to national heritage.',
 '/images/mandals/kesariwada.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Tulshibaug Mandal',
 'Tulshibaug, Pune – 411002',
 'Temple-inspired Grandeur',
 'Celebrated for magnificent temple-replica pandals, classical music performances and strong community involvement that draws lakhs of devotees and tourists every year.',
 '/images/mandals/tulshibag.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com')),

('Bhausaheb Rangari Mandal',
 'Raviwar Peth, Pune – 411002',
 'Second Manacha Mandal',
 'Holds the prestigious second position among Pune''s Panchanga Mandals. Founded 1893. Famed for its towering idol and the grand Anant Chaturdashi visarjan procession.',
 '/images/mandals/bhausaheb-rangari.jpg',
 (SELECT id FROM users WHERE email='admin@ganeshfest.com'));

-- Step 7: Re-insert events
INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Morning Aarti Ceremony', 'aarti',
       'Grand morning aarti with dhol-tasha music. Open to all devotees.',
       NOW() + INTERVAL '3 days', m.location, 500,
       (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Rangoli Competition', 'competition',
       'Inter-colony rangoli competition. Theme: Ganesh Utsav 2026.',
       NOW() + INTERVAL '4 days', 'Kasba Peth Ground', 100,
       (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Bhajan & Kirtan Night', 'cultural',
       'Divine bhajans and kirtans in the presence of Dagdusheth Ganapati.',
       NOW() + INTERVAL '5 days', 'Budhwar Peth Mandal', 600,
       (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Shrimant Dagdusheth Halwai Ganapati';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Kushti Championship', 'competition',
       'Traditional Maharashtrian wrestling competition honouring the talim legacy.',
       NOW() + INTERVAL '6 days', 'Shukrawar Peth Akhada', 200,
       (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Guruji Talim Mandal';

INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
SELECT m.id, 'Grand Visarjan Procession', 'cultural',
       'Anant Chaturdashi farewell procession. Join lakhs of devotees on the streets of Pune!',
       NOW() + INTERVAL '10 days', 'Pune City Route', 10000,
       (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Bhausaheb Rangari Mandal';

-- Step 8: Re-insert donations
INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Suresh Joshi', 'suresh@example.com', '9800001111', 5000.00, m.id,
       'Decoration Fund', 'upi', (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Meena Kulkarni', 'meena@example.com', '9800002222', 2500.00, m.id,
       'Event Expenses', 'cash', (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Shrimant Dagdusheth Halwai Ganapati';

INSERT INTO donations (donor_name, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
SELECT 'Vikram Singh', '9800003333', 10000.00, m.id,
       'General Donation', 'bank_transfer', (SELECT id FROM users WHERE email='admin@ganeshfest.com')
FROM mandals m WHERE m.name = 'Bhausaheb Rangari Mandal';

-- Step 9: Re-insert volunteer
INSERT INTO volunteers (user_id, mandal_id, skills, availability)
SELECT (SELECT id FROM users WHERE email='rahul@example.com'),
       m.id, 'Photography, Event Management, Sound Systems', 'Full Day'
FROM mandals m WHERE m.name = 'Kasba Ganapati Mandal';

-- Step 10: Refresh announcements
DELETE FROM announcements;
INSERT INTO announcements (title, content, priority, posted_by) VALUES
('Festival Schedule 2026 Released',
 'The complete 10-day schedule for all Pune mandals is now live on the Events page!',
 'high', (SELECT id FROM users WHERE email='admin@ganeshfest.com')),
('Darshan Pass System Launched',
 'Book your Darshan pass online and skip the queue! Priority and VIP slots now available.',
 'urgent', (SELECT id FROM users WHERE email='admin@ganeshfest.com')),
('Volunteer Registration Open',
 'Join our team for Ganesh Utsav 2026. Register as a volunteer today!',
 'normal', (SELECT id FROM users WHERE email='admin@ganeshfest.com')),
('Eco-Friendly Ganeshotsav Drive',
 'All mandals are joining our 100% eco-friendly celebration drive this year.',
 'high', (SELECT id FROM users WHERE email='admin@ganeshfest.com'));

-- Verify
SELECT 'SUCCESS: ' || COUNT(*) || ' mandals now in database.' AS result FROM mandals;
SELECT id, name FROM mandals ORDER BY id;