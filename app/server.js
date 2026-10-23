'use strict';
const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
});

// ---- structured JSON logs (collected by Promtail -> Loki) ----
const log = (level, msg, extra = {}) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));

// ---- Prometheus metrics ----
client.collectDefaultMetrics();
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
});
const txCreated = new client.Counter({ name: 'expense_transactions_created_total', help: 'Transactions created', labelNames: ['type'] });

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : 'other';
    end({ method: req.method, route, status: res.statusCode });
    log(res.statusCode >= 500 ? 'error' : 'info', 'request', {
      method: req.method, path: req.originalUrl, status: res.statusCode,
    });
  });
  next();
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.get('/healthz', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'db_down' }); }
});

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  log('error', 'handler_failed', { error: e.message });
  res.status(500).json({ error: 'internal_error' });
});

// ---- Categories ----
app.get('/api/categories', wrap(async (_req, res) => {
  res.json((await pool.query('SELECT id, name, type FROM categories ORDER BY name')).rows);
}));
app.post('/api/categories', wrap(async (req, res) => {
  const { name, type } = req.body || {};
  if (!name || typeof name !== 'string' || name.length > 50 || !['income', 'expense'].includes(type))
    return res.status(400).json({ error: 'invalid_input' });
  const r = await pool.query('INSERT INTO categories(name,type) VALUES($1,$2) RETURNING id,name,type', [name.trim(), type]);
  res.status(201).json(r.rows[0]);
}));
app.delete('/api/categories/:id', wrap(async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [parseInt(req.params.id, 10)]);
    res.status(204).end();
  } catch (e) {
    if (e.code === '23503') return res.status(409).json({ error: 'category_in_use' });
    throw e;
  }
}));

// ---- Transactions ----
app.get('/api/transactions', wrap(async (_req, res) => {
  const r = await pool.query(
    `SELECT t.id, t.amount, t.note, t.occurred_on, c.name AS category, c.type
       FROM transactions t JOIN categories c ON c.id=t.category_id
      ORDER BY t.occurred_on DESC, t.id DESC LIMIT 200`);
  res.json(r.rows);
}));
app.post('/api/transactions', wrap(async (req, res) => {
  const { category_id, amount, note, occurred_on } = req.body || {};
  const amt = Number(amount);
  if (!Number.isInteger(category_id) || !(amt > 0) || amt > 1e12 ||
      (note && String(note).length > 200) || !/^\d{4}-\d{2}-\d{2}$/.test(occurred_on || ''))
    return res.status(400).json({ error: 'invalid_input' });
  const r = await pool.query(
    'INSERT INTO transactions(category_id,amount,note,occurred_on) VALUES($1,$2,$3,$4) RETURNING id',
    [category_id, amt, note || null, occurred_on]);
  const c = await pool.query('SELECT type FROM categories WHERE id=$1', [category_id]);
  txCreated.inc({ type: c.rows[0] ? c.rows[0].type : 'unknown' });
  res.status(201).json(r.rows[0]);
}));
app.delete('/api/transactions/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM transactions WHERE id=$1', [parseInt(req.params.id, 10)]);
  res.status(204).end();
}));

// ---- Reports ----
app.get('/api/reports/summary', wrap(async (_req, res) => {
  const totals = (await pool.query(
    `SELECT COALESCE(SUM(amount) FILTER (WHERE c.type='income'),0) AS income,
            COALESCE(SUM(amount) FILTER (WHERE c.type='expense'),0) AS expense
       FROM transactions t JOIN categories c ON c.id=t.category_id`)).rows[0];
  const byCategory = (await pool.query(
    `SELECT c.name, c.type, SUM(t.amount) AS total
       FROM transactions t JOIN categories c ON c.id=t.category_id
      GROUP BY c.name, c.type ORDER BY total DESC`)).rows;
  const byMonth = (await pool.query(
    `SELECT to_char(date_trunc('month', t.occurred_on),'YYYY-MM') AS month,
            SUM(t.amount) FILTER (WHERE c.type='income') AS income,
            SUM(t.amount) FILTER (WHERE c.type='expense') AS expense
       FROM transactions t JOIN categories c ON c.id=t.category_id
      GROUP BY 1 ORDER BY 1 DESC LIMIT 12`)).rows;
  res.json({ totals, byCategory, byMonth });
}));

app.use(express.static('public', { maxAge: '1h' }));

app.listen(3000, () => log('info', 'server_started', { port: 3000 }));
