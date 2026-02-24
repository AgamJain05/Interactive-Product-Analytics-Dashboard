const { query } = require('../config/db');

/**
 * POST /api/track
 * Body: { feature }
 * Records a feature click for the authenticated user.
 */
const trackClick = async (req, res) => {
    const { feature } = req.body;
    const userId = req.user.id;

    if (!feature) {
        return res.status(400).json({ message: 'feature is required.' });
    }

    await query(
        'INSERT INTO feature_clicks (user_id, feature) VALUES ($1, $2)',
        [userId, feature]
    );

    res.status(201).json({ message: 'Click tracked.' });
};

module.exports = { trackClick };
