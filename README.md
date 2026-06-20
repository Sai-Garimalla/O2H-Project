# ⚡ TaskFlow Pro

> A full-stack, production-ready Task Management application with a Kanban board UI, JWT authentication, security hardening, and a vibrant light/dark masala design theme.

---

## 🗂️ Project Structure

```
o2h_Assignment/
├── backend/                   # Node.js + Express REST API
│   ├── config/
│   │   └── db.js              # MongoDB connection via Mongoose
│   ├── controllers/
│   │   ├── authController.js  # Register & Login logic
│   │   └── taskController.js  # CRUD + pagination + search + sort
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware (hardened)
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt hashed passwords)
│   │   └── Task.js            # Task schema with status enum
│   ├── routes/
│   │   ├── authRoutes.js      # POST /api/auth/register, /login
│   │   └── taskRoutes.js      # GET/POST /tasks, PUT/DELETE /tasks/:id
│   ├── tests/
│   │   └── task.test.js       # Jest + Supertest integration tests
│   ├── .env                   # Environment variables (never committed)
│   ├── package.json
│   └── server.js              # Express app entry point (security hardened)
│
└── frontend/                  # React 19 SPA
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js       # Login + Register page
    │   │   ├── Dashboard.js   # Kanban board + stats + search
    │   │   └── AddTask.js     # Create task form
    │   ├── services/
    │   │   └── api.js         # Axios instance + interceptors
    │   ├── utils/
    │   │   ├── auth.js        # Token storage + expiry check
    │   │   └── sanitize.js    # Input sanitization (anti-XSS)
    │   ├── App.js             # Router, Navbar, theme toggle
    │   └── index.css          # Full design system (CSS variables, animations)
    ├── .env                   # REACT_APP_API_URL
    ├── tailwind.config.js
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | Component-based UI framework |
| **React Router DOM** | 7.x | Client-side routing (SPA navigation) |
| **Axios** | 1.x | HTTP client for API calls |
| **Tailwind CSS** | 3.x | Utility-first CSS (dark mode via `class` strategy) |
| **Lucide React** | latest | Icon library (Zap, Mail, Lock, CheckCircle, etc.) |
| **Plus Jakarta Sans** | Google Fonts | Premium typography |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | — | JavaScript runtime |
| **Express** | 5.x | Web framework |
| **MongoDB** | — | NoSQL database |
| **Mongoose** | 9.x | ODM — schema modeling + validation |
| **bcryptjs** | 3.x | Password hashing (10 salt rounds) |
| **jsonwebtoken** | 9.x | JWT generation + verification (30-day expiry) |
| **helmet** | — | Security HTTP headers |
| **express-rate-limit** | — | Brute-force protection on auth routes |
| **hpp** | — | HTTP Parameter Pollution protection |
| **cors** | — | Cross-Origin Resource Sharing (whitelisted) |
| **dotenv** | 17.x | Environment variable loading |

### Dev / Testing
| Technology | Purpose |
|---|---|
| **Jest** | Unit & integration test runner |
| **Supertest** | HTTP assertion library for Express |
| **cross-env** | Cross-platform `NODE_ENV` setting |

---

## ✨ Features — Frontend

### 🎨 Design System
- **Masala Color Palette** — vibrant violet (`#7c3aed`) → fuchsia (`#e11d78`) → amber (`#f59e0b`) gradients
- **CSS Custom Properties** — full design tokens for both light and dark themes
- **Animated Mesh Background** — aurora-like radial gradient backdrop
- **Glassmorphism Cards** — `backdrop-filter: blur(20px)` with semi-transparent backgrounds
- **Plus Jakarta Sans** — premium Google Font used across all UI

### 🌗 Light / Dark Theme
- Toggle in navbar; preference **persisted to `localStorage`** — survives refresh
- On mount, saved preference is applied before first render (no flash)
- Dark mode via `dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- All colors sourced from CSS variables — no hardcoded values in components

### 🧭 Navigation & Routing
- **Protected Routes** — `/` and `/add` redirect to `/login` if not authenticated
- **Auth Guard on Mount** — JWT expiry decoded client-side on startup; auto-logout if expired
- Navbar shows **user avatar initial** and logout button only when authenticated

### 🔐 Login / Register Page
- Single page toggling between Login and Register mode
- Animated **floating background blobs** with CSS `border-radius` morphing animation
- **Glassmorphism card** with tri-color gradient top accent bar
- **Icon-prefixed inputs** — Mail, Lock, User icons with proper 44px padding (no collision)
- **Show/Hide Password** toggle button
- **Rate-limit cooldown** — 3 failures → submit disabled for 3 seconds (client-side)
- Proper `autocomplete` attributes for browser password manager support

### 📊 Dashboard
- **Stat Cards** — gradient cards (purple, orange/red, teal) showing live task counts
- **Kanban Board** — three columns: **To Do** (amber), **In Progress** (violet), **Done** (emerald)
- **Task Cards** — colored left border, title, clamped description, date chip, hover actions
- **Inline Double-Confirm Delete** — first click shows warning icon, second click within 3s deletes
- **Skeleton Loader** — shimmer placeholder cards while loading (no basic spinner)
- **Search** — real-time regex search on task titles via backend
- **Sort** — Latest First / Oldest First dropdown
- **Pagination** — Prev/Next with current-page indicator

### ➕ Add Task Page
- **Live character counter** on description — red hint until 20 chars, then green ✓
- **Visual Status Pills** — clickable pill buttons with glow effect instead of a dropdown
- **Animated success screen** — green checkmark flash before redirecting to dashboard
- Input sanitization before every API call

---

## ✨ Features — Backend

### 🗄️ Database Models

#### `User` Schema
| Field | Type | Constraints |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique |
| `password` | String | required, bcrypt hashed |
| `timestamps` | Auto | `createdAt`, `updatedAt` |

- **Pre-save hook** — auto-hashes password with `bcrypt.genSalt(10)` before every save
- **`matchPassword()`** — compares plain-text vs. hash using `bcrypt.compare()`

#### `Task` Schema
| Field | Type | Constraints |
|---|---|---|
| `user` | ObjectId | ref: User, required |
| `title` | String | required |
| `description` | String | required, minlength: 20 |
| `status` | String | enum: Pending/In Progress/Completed, default: Pending |
| `timestamps` | Auto | `createdAt`, `updatedAt` |

- Tasks are **user-scoped** — every query filters by `user: req.user._id`

### 🔗 API Endpoints

#### Auth — `POST /api/auth/`
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password}` | `{_id, name, email, token}` |
| POST | `/api/auth/login` | `{email, password}` | `{_id, name, email, token}` |

#### Tasks — `/tasks/` *(JWT required)*
| Method | Endpoint | Params / Body | Description |
|---|---|---|---|
| GET | `/tasks` | `search, status, sort, page, limit` | Paginated tasks + stats |
| POST | `/tasks` | `{title, description, status}` | Create task |
| PUT | `/tasks/:id` | `{status}` | Update task status |
| DELETE | `/tasks/:id` | — | Delete task |

#### `GET /tasks` Query Logic
1. Filters by `user: req.user._id` — strict user isolation
2. `search` → `$regex` case-insensitive title match
3. `status` → exact match (skipped if "All")
4. `sort` → `createdAt: -1` (newest) or `createdAt: 1` (oldest)
5. `skip + limit` → pagination
6. Separate `countDocuments` → computes `totalPages`
7. Second find (no limit) → live stats (total, pending, completed)

### 🔒 Security Architecture

#### `server.js` — Express Hardening
| Layer | Effect |
|---|---|
| `helmet()` | Sets 15+ security headers (XSS, no-sniff, HSTS, frameguard, etc.) |
| `cors()` | Whitelisted to `ALLOWED_ORIGIN` env var only — all other origins rejected |
| `express-rate-limit` | Auth routes: max 10 requests / 15 min / IP |
| `express.json({ limit: '10kb' })` | Blocks large-payload DoS attacks |
| `hpp()` | Blocks HTTP Parameter Pollution attacks |
| `app.disable('x-powered-by')` | Hides Express fingerprint |
| 404 + global error handler | JSON responses for all errors |

#### `middleware/auth.js` — JWT Verification
1. Requires `Authorization: Bearer <token>` header
2. Verifies with `process.env.JWT_SECRET` — **no fallback secret**
3. Validates `decoded.id` is a valid MongoDB ObjectId
4. Confirms user still exists in DB
5. Distinguishes `TokenExpiredError` from tampered tokens

#### Frontend Security
| File | What it does |
|---|---|
| `utils/sanitize.js` | Strips HTML tags, null bytes, enforces per-field max lengths before every API call |
| `utils/auth.js` | Decodes JWT `exp` claim client-side; auto-logout on expiry |
| `services/api.js` | Axios interceptors: auto-attach JWT on requests, auto-logout on 401 responses |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port `27017`

### 1. Clone the Repository
```bash
git clone https://github.com/Sai-Garimalla/O2H-Project.git
cd O2H-Project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/o2h_tasks
JWT_SECRET=your_super_secret_key_here_change_this
ALLOWED_ORIGIN=http://localhost:3000
```

> ⚠️ `JWT_SECRET` is **mandatory** — the server exits on startup if missing.

```bash
node server.js
# Server running on port 5000
# MongoDB Connected: 127.0.0.1
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

```bash
npm start
# Opens http://localhost:3000
```

### 4. Run Tests
```bash
cd backend
npm test
```

---

## 🔄 Application Flow

```
User visits localhost:3000
        │
        ▼
App.js mounts → reads theme from localStorage → applies dark/light
        │
        ▼
isTokenValid() → checks JWT exp claim client-side
        │
   ┌────┴────┐
 Valid?     Expired / None
   │              │
   ▼              ▼
Dashboard      /login page
   │
   ▼
fetchTasks() → Axios attaches Bearer token → Backend verifies JWT
   │
   ▼
Tasks rendered in Kanban columns
   │
   ├── "New Task" → /add → sanitize → POST /tasks
   ├── ArrowRight on card → PUT /tasks/:id (Pending → In Progress → Completed)
   ├── Delete (double-confirm) → DELETE /tasks/:id
   └── Logout → clearStoredUser() → redirect to /login
```

---

## 🔐 Security Checklist

| ✅ | Measure | Location |
|---|---|---|
| ✅ | Passwords hashed (bcrypt, 10 rounds) | `models/User.js` |
| ✅ | JWT secret from env only (no fallback) | `authController.js`, `middleware/auth.js` |
| ✅ | JWT expiry checked client-side | `utils/auth.js` |
| ✅ | Auto-logout on 401 | `services/api.js` |
| ✅ | Security HTTP headers | `helmet()` in `server.js` |
| ✅ | CORS locked to known origin | `server.js` |
| ✅ | Auth rate limiting (10/15min) | `server.js` |
| ✅ | Body size limit (10kb) | `server.js` |
| ✅ | HTTP Parameter Pollution blocked | `hpp()` in `server.js` |
| ✅ | ObjectId validated before DB query | `middleware/auth.js` |
| ✅ | User ownership check on update/delete | `taskController.js` |
| ✅ | HTML/script stripping on all inputs | `utils/sanitize.js` |
| ✅ | Client-side login cooldown | `Login.js` |
| ✅ | API URL from env (no hardcoded localhost) | `services/api.js` |
| ✅ | No tokens logged to console | `utils/auth.js`, `services/api.js` |

---

## 📋 Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | 5000 | Server port |
| `MONGO_URI` | ✅ Yes | — | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | — | JWT signing secret (must be long & random) |
| `ALLOWED_ORIGIN` | No | `http://localhost:3000` | CORS whitelist URL |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `REACT_APP_API_URL` | No | `http://localhost:5000` | Backend API base URL |

---

*Built as part of the **o2h hiring assignment** — demonstrating REST API design, JWT auth, MongoDB data modeling, React architecture, security hardening, and premium UI/UX design.*
