const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Since I am using Render PostgreSQL, I have to add this line
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err.message);
});

/**
 * Run a parameterised SQL query.
 * @param {string} text - SQL query string with $1, $2, ... placeholders
 * @param {Array}  params - values that replace the placeholders
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
