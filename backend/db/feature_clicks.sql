-- Run via: node db/migrate.js (migrate.js reads all *.sql in db/)
-- Or run standalone via seed.js which calls this automatically.

CREATE TABLE IF NOT EXISTS feature_clicks (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    feature    VARCHAR(50)  NOT NULL,
    clicked_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_clicks_feature    ON feature_clicks(feature);
CREATE INDEX IF NOT EXISTS idx_feature_clicks_clicked_at ON feature_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_feature_clicks_user_id    ON feature_clicks(user_id);
