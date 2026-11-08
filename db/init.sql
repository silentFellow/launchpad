CREATE TABLE IF NOT EXISTS missions (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO missions (title, done) VALUES
  ('Write Dockerfiles for each tier', TRUE),
  ('Wire services with docker compose', TRUE),
  ('Isolate the database network', FALSE),
  ('Persist data with a named volume', FALSE);
