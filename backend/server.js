const express = require('express');
const { Pool } = require('pg');

// Connection settings come from PGHOST/PGUSER/PGPASSWORD/PGDATABASE
const pool = new Pool();
const app = express();
app.use(express.json());

const cleanTitle = (t) => (typeof t === 'string' ? t.trim() : '');

app.get('/api/health', async (_req, res) => {
  const { rows } = await pool.query('SELECT version()');
  res.json({ api: 'up', db: rows[0].version.split(' ').slice(0, 2).join(' ') });
});

app.get('/api/missions', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM missions ORDER BY done, created_at DESC');
  res.json(rows);
});

app.post('/api/missions', async (req, res) => {
  const title = cleanTitle(req.body?.title);
  if (!title || title.length > 200) return res.status(400).json({ error: 'title must be 1-200 characters' });
  const { rows } = await pool.query('INSERT INTO missions (title) VALUES ($1) RETURNING *', [title]);
  res.status(201).json(rows[0]);
});

app.patch('/api/missions/:id', async (req, res) => {
  const { rows } = await pool.query(
    'UPDATE missions SET done = NOT done WHERE id = $1 RETURNING *',
    [Number(req.params.id) || 0]
  );
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'not found' });
});

app.delete('/api/missions/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM missions WHERE id = $1', [Number(req.params.id) || 0]);
  rowCount ? res.status(204).end() : res.status(404).json({ error: 'not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(3000, () => console.log('API listening on :3000'));
