const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByUsername, createUser } = require('../models/userModel');

const SALT_ROUNDS = 10;

/** Signs a JWT for the given user id */
const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res) => {
    const { username, password, age, gender } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate
    const existing = await findByUsername(username);
    if (existing) {
        return res.status(409).json({ message: 'Username already taken.' });
    }

    // Hash & store
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ username, hashedPassword, age, gender });

    const token = signToken(user.id);
    return res.status(201).json({ token, user });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await findByUsername(username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user; // strip the hash before sending
    return res.status(200).json({ token, user: safeUser });
};

module.exports = { register, login };
