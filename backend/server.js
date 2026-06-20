const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

// Fail fast if JWT_SECRET is missing — no insecure fallback
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
    process.exit(1);
}

connectDB();

const app = express();

// ── Security Headers (helmet) ────────────────────────────────────────────────
app.use(helmet());                        // Sets X-Content-Type-Options, X-Frame-Options, HSTS, etc.
app.disable('x-powered-by');             // Belt-and-suspenders: hide tech stack

// ── CORS — allow only the trusted frontend origin ─────────────────────────────
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman in dev) OR the whitelisted origin
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing — cap payload at 10 kb to block large-payload DoS ───────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── HTTP Parameter Pollution Protection ──────────────────────────────────────
app.use(hpp());

// ── Auth Rate Limiter — 10 attempts per 15 minutes per IP ───────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts from this IP. Please try again after 15 minutes.' },
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/tasks', taskRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;