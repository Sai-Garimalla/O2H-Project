const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
    // JWT_SECRET is guaranteed to exist — server.js exits without it
    const secret = process.env.JWT_SECRET;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secret);

        // Validate that decoded.id is a real MongoDB ObjectId before hitting the DB
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({ message: 'Not authorized, invalid token payload' });
        }

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        // Distinguish expired vs. tampered tokens
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };