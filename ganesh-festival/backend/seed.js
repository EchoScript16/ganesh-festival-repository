// backend/seed.js
// Run this ONCE after setting up the database to insert correct demo data:
//   node seed.js
//
// It hashes passwords fresh using bcrypt so login always works.

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'ganesh_festival_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

async function seed() {
    console.log('🌱 Seeding database...\n');

    try {
        // Hash the demo password
        const hash = await bcrypt.hash('Admin@123', 10);
        console.log('✅ Password hashed');

        // Users
        await pool.query(`
            INSERT INTO users (name, email, password, role, phone) VALUES
            ('Admin User',   'admin@ganeshfest.com', $1, 'admin',     '9876543210'),
            ('Rahul Sharma', 'rahul@example.com',    $1, 'volunteer', '9876543211'),
            ('Priya Patel',  'priya@example.com',    $1, 'user',      '9876543212')
            ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
        `, [hash]);
        console.log('✅ Users seeded (admin, volunteer, user)');

        // Mandals
// Mandals (UPDATED - 7 Famous Pune Ganpati)
await pool.query(`
    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Shreemant Dagdusheth Halwai Ganpati', 'Budhwar Peth, Pune', 'Devotional Grandeur',
           'Established in 1893, Pune''s most famous Ganpati attracting lakhs of devotees.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Bhausaheb Rangari Ganpati', 'Shukrawar Peth, Pune', 'Freedom Fighter Legacy',
           'First public Ganpati started in 1892, linked with freedom movement.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Kasba Ganpati', 'Kasba Peth, Pune', 'Gram Daivat',
           'Presiding deity of Pune established by Jijabai.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Tambadi Jogeshwari Ganpati', 'Budhwar Peth, Pune', 'Traditional Heritage',
           'One of the oldest mandals with strong cultural roots.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Guruji Talim Ganpati', 'Laxmi Road, Pune', 'Unity & Brotherhood',
           'Symbol of Hindu-Muslim unity since 1887.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Tulshibaug Ganpati', 'Tulshibaug, Pune', 'Majestic Idol',
           'Famous for its tall and attractive idol.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO mandals (name, location, theme, description, created_by)
    SELECT 'Kesariwada Ganpati', 'Narayan Peth, Pune', 'Tilak Legacy',
           'Started by Lokmanya Tilak to unite people during freedom movement.', u.id
    FROM users u WHERE u.email = 'admin@ganeshfest.com'
    ON CONFLICT (name) DO NOTHING;
`);

        // Events
// Events (UPDATED - Unique + Social Campaigns)
await pool.query(`
    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Maha Aarti & Darshan', 'aarti',
           'Grand aarti attended by thousands of devotees',
           NOW() + INTERVAL '2 days', 'Dagdusheth Temple', 1000, u.id
    FROM mandals m, users u
    WHERE m.name = 'Shreemant Dagdusheth Halwai Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Freedom Awareness Program', 'cultural',
           'Program highlighting India''s freedom struggle',
           NOW() + INTERVAL '3 days', 'Rangari Mandal', 300, u.id
    FROM mandals m, users u
    WHERE m.name = 'Bhausaheb Rangari Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Dhol-Tasha Competition', 'competition',
           'Traditional dhol-tasha performance competition',
           NOW() + INTERVAL '4 days', 'Kasba Ground', 200, u.id
    FROM mandals m, users u
    WHERE m.name = 'Kasba Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Swachh Pune Cleanliness Drive', 'other',
           'Social campaign promoting cleanliness',
           NOW() + INTERVAL '5 days', 'Budhwar Peth', 150, u.id
    FROM mandals m, users u
    WHERE m.name = 'Tambadi Jogeshwari Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Blood Donation Camp', 'other',
           'Donate blood and save lives',
           NOW() + INTERVAL '6 days', 'Guruji Talim Hall', 200, u.id
    FROM mandals m, users u
    WHERE m.name = 'Guruji Talim Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Eco-Friendly Idol Workshop', 'cultural',
           'Learn to make eco-friendly Ganpati idols',
           NOW() + INTERVAL '7 days', 'Tulshibaug Area', 100, u.id
    FROM mandals m, users u
    WHERE m.name = 'Tulshibaug Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;

    INSERT INTO events (mandal_id, title, type, description, event_date, location, max_participants, created_by)
    SELECT m.id, 'Youth Debate Competition', 'competition',
           'Debate on social issues and youth development',
           NOW() + INTERVAL '8 days', 'Kesariwada Hall', 80, u.id
    FROM mandals m, users u
    WHERE m.name = 'Kesariwada Ganpati' AND u.email = 'admin@ganeshfest.com'
    ON CONFLICT DO NOTHING;
`);

        // Donations
        await pool.query(`
            INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
            SELECT 'Suresh Joshi',   'suresh@example.com', '9800001111', 5000.00, m.id, 'Decoration Fund',  'upi',           u.id
            FROM mandals m, users u WHERE m.name = 'Kasba Ganesh Mandal' AND u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
            SELECT 'Meena Kulkarni', 'meena@example.com',  '9800002222', 2500.00, m.id, 'Event Expenses',   'cash',          u.id
            FROM mandals m, users u WHERE m.name = 'Tambdi Jogeshwari Mandal' AND u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO donations (donor_name, donor_email, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
            SELECT 'Vikram Singh',   'vikram@example.com', '9800003333', 10000.00,m.id, 'General Donation', 'bank_transfer', u.id
            FROM mandals m, users u WHERE m.name = 'Kasba Ganesh Mandal' AND u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO donations (donor_name, donor_phone, amount, mandal_id, purpose, payment_mode, recorded_by)
            SELECT 'Anita Desai', '9800004444', 1000.00, m.id, 'Prasad Fund', 'cash', u.id
            FROM mandals m, users u WHERE m.name = 'Guruji Talim Mandal' AND u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Donations seeded');

        // Announcements
        await pool.query(`
            INSERT INTO announcements (title, content, priority, posted_by)
            SELECT 'Festival Schedule Released',
                   'The complete schedule for Ganesh Festival has been released. Check the events page for details.',
                   'high', u.id FROM users u WHERE u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO announcements (title, content, priority, posted_by)
            SELECT 'Volunteer Registration Open',
                   'We are accepting volunteer registrations. Join us and be part of the celebration!',
                   'normal', u.id FROM users u WHERE u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO announcements (title, content, priority, posted_by)
            SELECT 'Eco-Friendly Initiative',
                   'This year we are going 100% eco-friendly. Please bring your own bags and avoid plastic.',
                   'urgent', u.id FROM users u WHERE u.email = 'admin@ganeshfest.com'
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Announcements seeded');

        // Complaints
        await pool.query(`
            INSERT INTO complaints (user_id, subject, description, status)
            SELECT u.id, 'Parking Issues near Mandal',
                   'There is severe parking congestion near the Kasba Peth mandal. Need better arrangements.',
                   'pending'
            FROM users u WHERE u.email = 'priya@example.com'
            ON CONFLICT DO NOTHING;

            INSERT INTO complaints (user_id, subject, description, status)
            SELECT u.id, 'Sound System Issue',
                   'The loud music after midnight is disturbing residents. Please regulate timings.',
                   'in_progress'
            FROM users u WHERE u.email = 'rahul@example.com'
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Complaints seeded');

        // Volunteer entry for Rahul
        await pool.query(`
            INSERT INTO volunteers (user_id, mandal_id, skills, availability)
            SELECT u.id, m.id, 'Photography, Event Management, Sound Systems', 'Full Day'
            FROM users u, mandals m
            WHERE u.email = 'rahul@example.com' AND m.name = 'Kasba Ganesh Mandal'
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Volunteer record seeded');

        console.log('\n🎉 All done! You can now log in with:');
        console.log('   Admin    → admin@ganeshfest.com  / Admin@123');
        console.log('   Volunteer→ rahul@example.com     / Admin@123');
        console.log('   User     → priya@example.com     / Admin@123\n');

    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await pool.end();
    }
}

seed();
