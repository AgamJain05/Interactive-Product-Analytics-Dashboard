const { query } = require('../config/db');

/**
 * Find a user by username.
 * Returns the full row (including hashed password) so the caller can compare.
 */
const findByUsername = async (username) => {
    const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0] || null;
};

/**
 * Insert a new user and return the created row (without password).
 */
const createUser = async ({ username, hashedPassword, age, gender }) => {
    const result = await query(
        `INSERT INTO users (username, password, age, gender)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, age, gender, created_at`,
        [username, hashedPassword, age || null, gender || null]
    );
    return result.rows[0];
};

module.exports = { findByUsername, createUser };
