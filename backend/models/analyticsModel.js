const { query } = require('../config/db');

/**
 * Total clicks per feature name.
 * Returns: [{ feature, count }]
 */
const getClicksByFeature = async ({ startDate, endDate, gender, ageMin, ageMax } = {}) => {
    const conditions = ['1=1'];
    const values = [];
    let i = 1;

    if (startDate) { conditions.push(`fc.clicked_at >= $${i++}`); values.push(startDate); }
    if (endDate) { conditions.push(`fc.clicked_at <= $${i++}`); values.push(endDate); }
    if (gender) { conditions.push(`u.gender = $${i++}`); values.push(gender); }
    if (ageMin) { conditions.push(`u.age >= $${i++}`); values.push(ageMin); }
    if (ageMax) { conditions.push(`u.age <= $${i++}`); values.push(ageMax); }

    const sql = `
        SELECT fc.feature,
               COUNT(*) AS count
        FROM   feature_clicks fc
        LEFT JOIN users u ON u.id = fc.user_id
        WHERE  ${conditions.join(' AND ')}
        GROUP  BY fc.feature
        ORDER  BY count DESC`;

    const result = await query(sql, values);
    return result.rows.map((r) => ({ feature: r.feature, count: Number(r.count) }));
};

/**
 * Daily click totals for the last N days.
 * Returns: [{ date: 'YYYY-MM-DD', count }]
 */
const getClicksOverTime = async ({ days = 90 } = {}) => {
    const result = await query(
        `SELECT TO_CHAR(DATE_TRUNC('day', clicked_at), 'YYYY-MM-DD') AS date,
                COUNT(*) AS count
         FROM   feature_clicks
         WHERE  clicked_at >= NOW() - INTERVAL '${Number(days)} days'
         GROUP  BY DATE_TRUNC('day', clicked_at)
         ORDER  BY date ASC`
    );
    return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }));
};

/**
 * Total clicks grouped by user gender.
 * Returns: [{ gender, count }]
 */
const getClicksByGender = async () => {
    const result = await query(
        `SELECT COALESCE(u.gender, 'unknown') AS gender,
                COUNT(*) AS count
         FROM   feature_clicks fc
         LEFT JOIN users u ON u.id = fc.user_id
         GROUP  BY COALESCE(u.gender, 'unknown')
         ORDER  BY count DESC`
    );
    return result.rows.map((r) => ({ gender: r.gender, count: Number(r.count) }));
};

/**
 * Total clicks grouped by age bracket.
 * Brackets: Under 18 | 18–34 | 35–54 | 55+
 * Returns: [{ ageGroup, count }]
 */
const getClicksByAgeGroup = async () => {
    const result = await query(
        `SELECT CASE
                    WHEN u.age IS NULL    THEN 'Unknown'
                    WHEN u.age < 18       THEN 'Under 18'
                    WHEN u.age BETWEEN 18 AND 34 THEN '18–34'
                    WHEN u.age BETWEEN 35 AND 54 THEN '35–54'
                    ELSE '55+'
                END AS age_group,
                COUNT(*) AS count
         FROM   feature_clicks fc
         LEFT JOIN users u ON u.id = fc.user_id
         GROUP  BY age_group
         ORDER  BY count DESC`
    );
    return result.rows.map((r) => ({ ageGroup: r.age_group, count: Number(r.count) }));
};

module.exports = { getClicksByFeature, getClicksOverTime, getClicksByGender, getClicksByAgeGroup };
