const { query } = require('../config/db');

/**
 * GET /api/health
 * Returns server status and a live DB ping.
 */
const getHealth = async (req, res) => {
    try {
        // Ping the database with a lightweight query
        const result = await query('SELECT NOW() AS db_time');
        res.status(200).json({
            status: 'ok',
            server: 'running',
            db: 'connected',
            db_time: result.rows[0].db_time,
        });
    } catch (err) {
        res.status(503).json({
            status: 'degraded',
            server: 'running',
            db: 'unreachable',
            error: err.message,
        });
    }
};

module.exports = { getHealth };
