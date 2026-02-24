const {
    getClicksByFeature,
    getClicksOverTime,
    getClicksByGender,
    getClicksByAgeGroup,
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

module.exports = { getAnalytics };
