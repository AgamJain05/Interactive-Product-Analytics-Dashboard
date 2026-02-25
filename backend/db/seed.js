/**
 * Seed script — creates dummy users + feature_click records.
 * Usage:  npm run seed
 *
 * Safe to re-run: users are inserted with ON CONFLICT DO NOTHING,
 * and feature_clicks are cleared then re-populated each run.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

// ─── Config ───────────────────────────────────────────────────────────────────
const FEATURES = ['date_filter', 'gender_filter', 'age_filter', 'bar_chart_click', 'bar_chart_zoom'];
const TOTAL_CLICKS = 160;   // records to generate
const SPREAD_DAYS = 90;    // how far back timestamps go

// Weighted probability so some features are clicked more than others (realistic)
const FEATURE_WEIGHTS = {
    date_filter: 30,
    gender_filter: 20,
    age_filter: 20,
    bar_chart_click: 25,
    bar_chart_zoom: 5,
};
const weightedFeatures = FEATURES.flatMap((f) => Array(FEATURE_WEIGHTS[f]).fill(f));

const DUMMY_USERS = [
    { username: 'alice_w', password: 'seed1234', age: 10, gender: 'female' },
    { username: 'bob_k', password: 'seed1234', age: 17, gender: 'male' },
    { username: 'carol_m', password: 'seed1234', age: 25, gender: 'female' },
    { username: 'david_r', password: 'seed1234', age: 32, gender: 'male' },
    { username: 'eve_s', password: 'seed1234', age: 41, gender: 'female' },
    { username: 'frank_t', password: 'seed1234', age: 55, gender: 'male' },
    { username: 'grace_l', password: 'seed1234', age: 63, gender: 'female' },
    { username: 'henry_b', password: 'seed1234', age: 72, gender: 'male' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Returns a random Date within the last `days` days */
const randomPastDate = (days) => {
    const now = Date.now();
    const msBack = randomInt(0, days) * 24 * 60 * 60 * 1000
        + randomInt(0, 23) * 60 * 60 * 1000
        + randomInt(0, 59) * 60 * 1000;
    return new Date(now - msBack);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
    try {
        // 1. Ensure feature_clicks table exists
        console.log('Running feature_clicks migration…');
        const clicksSql = fs.readFileSync(path.join(__dirname, 'feature_clicks.sql'), 'utf8');
        await query(clicksSql);

        // 2. Insert dummy users (skip if username already exists)
        console.log('Seeding users…');
        const userIds = [];
        for (const u of DUMMY_USERS) {
            const hash = await bcrypt.hash(u.password, 10);
            const result = await query(
                `INSERT INTO users (username, password, age, gender)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO UPDATE
                   SET age = EXCLUDED.age, gender = EXCLUDED.gender
                 RETURNING id`,
                [u.username, hash, u.age, u.gender]
            );
            userIds.push(result.rows[0].id);
        }
        console.log(`  ✔ ${userIds.length} users ready (ids: ${userIds.join(', ')})`);

        // 3. Clear existing seed data, then insert fresh clicks
        console.log('Clearing old feature_clicks…');
        await query('DELETE FROM feature_clicks WHERE user_id = ANY($1)', [userIds]);

        console.log(`Inserting ${TOTAL_CLICKS} feature_click records…`);
        for (let i = 0; i < TOTAL_CLICKS; i++) {
            const userId = randomItem(userIds);
            const feature = randomItem(weightedFeatures);
            const clickedAt = randomPastDate(SPREAD_DAYS);
            await query(
                'INSERT INTO feature_clicks (user_id, feature, clicked_at) VALUES ($1, $2, $3)',
                [userId, feature, clickedAt]
            );
        }
        console.log(`  ✔ ${TOTAL_CLICKS} clicks inserted`);

        console.log('\n🌱 Seed complete!');
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
})();
