# 🎉 Ganesh Festival Event Coordination System

A full-stack web application for managing Ganesh festival events, volunteers, donations, complaints and more.

**Stack:** Node.js + Express · PostgreSQL · JWT Auth · Vanilla HTML/CSS/JS

---

## 📁 Project Structure

```
ganesh-festival/
├── backend/
│   ├── config/
│   │   └── db.js                  # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Me
│   │   ├── mandalController.js    # Mandal CRUD
│   │   ├── eventController.js     # Event CRUD + Registration
│   │   ├── donationController.js  # Donation management
│   │   ├── volunteerController.js # Volunteer registration & tasks
│   │   ├── complaintController.js # Complaint submission & resolution
│   │   ├── announcementController.js
│   │   └── mediaController.js     # File uploads
│   ├── middleware/
│   │   └── auth.js                # JWT authenticate + authorize
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mandals.js
│   │   ├── events.js
│   │   ├── donations.js
│   │   ├── volunteers.js
│   │   ├── complaints.js
│   │   ├── announcements.js
│   │   └── media.js
│   ├── uploads/                   # Media uploads stored here
│   ├── schema.sql                 # Database schema + seed data
│   ├── server.js                  # Express entry point
│   ├── package.json
│   └── .env.example               # Copy to .env and configure
│
└── frontend/
    ├── css/
    │   └── style.css              # Full responsive stylesheet
    ├── js/
    │   └── api.js                 # Shared API utilities
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── mandals.html
    │   ├── events.html
    │   ├── donations.html
    │   ├── dashboard.html
    │   ├── admin.html
    │   └── gallery.html
    └── index.html                 # Home page
```

---

## 🚀 How to Run the Project

### Step 1 — Install PostgreSQL
Download and install from https://www.postgresql.org/download/

### Step 2 — Create the Database
Open your PostgreSQL shell (psql) or pgAdmin and run:
```sql
CREATE DATABASE ganesh_festival_db;
```

### Step 3 — Run the Schema
```bash
psql -U postgres -d ganesh_festival_db -f backend/schema.sql
```
This creates all tables and inserts sample data including an admin user.

### Step 4 — Configure Environment Variables
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_actual_postgres_password
```

### Step 5 — Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 6 — Seed the Database (Recommended)
This generates correct bcrypt hashes for demo users:
```bash
node seed.js
```
> Skip this if you already ran `schema.sql` — but run seed.js if login fails.

### Step 7 — Start the Server
```bash
npm start           # Production
# or
npm run dev         # Development with auto-restart (uses nodemon)
```

### Step 7 — Open the App
Visit: **http://localhost:5000**

---

## 🔑 Demo Login Credentials

| Role      | Email                    | Password   |
|-----------|--------------------------|------------|
| Admin     | admin@ganeshfest.com     | Admin@123  |
| Volunteer | rahul@example.com        | Admin@123  |
| User      | priya@example.com        | Admin@123  |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint            | Description          | Auth Required |
|--------|---------------------|----------------------|---------------|
| POST   | /api/auth/register  | Register new user    | No            |
| POST   | /api/auth/login     | Login                | No            |
| GET    | /api/auth/me        | Get current user     | Yes           |

### Mandals
| Method | Endpoint          | Auth       |
|--------|-------------------|------------|
| GET    | /api/mandals      | No         |
| GET    | /api/mandals/:id  | No         |
| POST   | /api/mandals      | Admin      |
| PUT    | /api/mandals/:id  | Admin      |
| DELETE | /api/mandals/:id  | Admin      |

### Events
| Method | Endpoint                | Auth             |
|--------|-------------------------|------------------|
| GET    | /api/events             | No               |
| GET    | /api/events/:id         | No               |
| POST   | /api/events             | Admin/Volunteer  |
| PUT    | /api/events/:id         | Admin/Volunteer  |
| DELETE | /api/events/:id         | Admin            |
| POST   | /api/events/:id/register| Any logged-in    |

### Donations
| Method | Endpoint           | Auth             |
|--------|--------------------|------------------|
| GET    | /api/donations     | Any logged-in    |
| POST   | /api/donations     | Admin/Volunteer  |
| DELETE | /api/donations/:id | Admin            |

### Volunteers
| Method | Endpoint                    | Auth    |
|--------|-----------------------------|---------|
| GET    | /api/volunteers             | Admin   |
| POST   | /api/volunteers/register    | User    |
| PUT    | /api/volunteers/:id/assign  | Admin   |

### Complaints
| Method | Endpoint                        | Auth    |
|--------|---------------------------------|---------|
| GET    | /api/complaints                 | Auth    |
| POST   | /api/complaints                 | Auth    |
| PUT    | /api/complaints/:id/resolve     | Admin   |

### Announcements
| Method | Endpoint                | Auth  |
|--------|-------------------------|-------|
| GET    | /api/announcements      | No    |
| POST   | /api/announcements      | Admin |
| DELETE | /api/announcements/:id  | Admin |

### Media
| Method | Endpoint         | Auth             |
|--------|------------------|------------------|
| GET    | /api/media       | No               |
| POST   | /api/media       | Admin/Volunteer  |
| DELETE | /api/media/:id   | Admin            |

---

## 🧪 Testing APIs

### Option A — Built-in Browser API Tester (No install needed!)
Visit: **http://localhost:5000/pages/api-tester.html**
- Click any endpoint on the left
- Use Quick Login buttons to get a token automatically
- Edit the request body and hit Send
- See the live response

### Option B — Postman

### Option B — Postman
1. **Import** `GaneshFestival_API.postman_collection.json` into Postman
2. Set base URL to `http://localhost:5000/api`
3. **Login first:**
   - POST `/auth/login` with `{"email": "admin@ganeshfest.com", "password": "Admin@123"}`
   - Copy the `token` from the response
4. **For protected routes:** Add header `Authorization: Bearer <your_token>`

### Quick Test Sequence:
```
1. POST /api/auth/login              → get token
2. GET  /api/mandals                 → list mandals (no auth needed)
3. POST /api/mandals                 → create mandal (admin token)
4. GET  /api/events                  → list events
5. POST /api/events/:id/register     → register for event (any user)
6. GET  /api/donations               → view donations (logged in)
7. GET  /api/announcements           → public announcements
```

---

## 🎨 Features Summary

| Feature               | Admin | Volunteer | User |
|-----------------------|-------|-----------|------|
| View mandals/events   | ✅    | ✅        | ✅   |
| Register for events   | ✅    | ✅        | ✅   |
| Create/Edit events    | ✅    | ✅        | ❌   |
| Manage mandals        | ✅    | ❌        | ❌   |
| Record donations      | ✅    | ✅        | ❌   |
| Upload to gallery     | ✅    | ✅        | ❌   |
| Submit complaints     | ✅    | ✅        | ✅   |
| Resolve complaints    | ✅    | ❌        | ❌   |
| Post announcements    | ✅    | ❌        | ❌   |
| View all volunteers   | ✅    | ❌        | ❌   |
| Assign tasks          | ✅    | ❌        | ❌   |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API, localStorage)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with pg driver
- **Authentication:** JWT (jsonwebtoken) + bcrypt password hashing
- **File Uploads:** Multer
- **Fonts:** Google Fonts (Yatra One + Hind)

---

*Developed for Ganesh Utsav — Ganapati Bappa Morya! 🙏*
