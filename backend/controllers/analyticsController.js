const {
    getClicksByFeature,
    getClicksOverTime,
    getClicksByGender,
    getClicksByAgeGroup,
    getClicksOverTimeByFeature,
} = require('../models/analyticsModel');

/**
 * GET /api/analytics
 *
 * Optional query params for filtering clicksByFeature:
 *   ?startDate=2024-01-01
 *   ?endDate=2024-12-31
 *   ?gender=male|female|other
 *   ?ageMin=18&ageMax=34
 *   ?days=30   (default 90, used for clicksOverTime)
 *
 * Response shape:
 * {
 *   clicksByFeature : [{ feature, count }],
 *   clicksOverTime  : [{ date, count }],
 *   clicksByGender  : [{ gender, count }],
 *   clicksByAgeGroup: [{ ageGroup, count }],
 * }
 */
const getAnalytics = async (req, res) => {
    const { startDate, endDate, gender, ageMin, ageMax, days } = req.query;

    const filters = {
        startDate: startDate || null,
        endDate: endDate || null,
        gender: gender || null,
        ageMin: ageMin ? Number(ageMin) : null,
        ageMax: ageMax ? Number(ageMax) : null,
    };

    const [clicksByFeature, clicksOverTime, clicksByGender, clicksByAgeGroup] =
        await Promise.all([
            getClicksByFeature(filters),
            getClicksOverTime({ days: days ? Number(days) : 90 }),
            getClicksByGender(),
            getClicksByAgeGroup(),
        ]);

    res.status(200).json({
        clicksByFeature,
        clicksOverTime,
        clicksByGender,
        clicksByAgeGroup,
    });
};

/**
 * GET /api/analytics/trend/:feature
 * Returns daily click counts for a specific feature.
 */
const getFeatureTrend = async (req, res) => {
    const { feature } = req.params;
    const days = req.query.days ? Number(req.query.days) : 90;
    const data = await getClicksOverTimeByFeature(feature, { days });
    res.status(200).json(data);
};

module.exports = { getAnalytics, getFeatureTrend };
