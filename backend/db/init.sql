-- Run this once against your Render PostgreSQL DB to create the users table.
-- You can run it via: psql $DATABASE_URL -f db/init.sql

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    password   TEXT         NOT NULL,
    age        INTEGER,
    gender     VARCHAR(20),
    created_at TIMESTAMPTZ  DEFAULT NOW()
);
