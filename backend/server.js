const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const tradesRouter = require('./routes/trades');
const targetsRouter = require('./routes/targets');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['https://journalfx.amalkhon.tech', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes — prefixed with /journalfx for api.amalkhon.tech/journalfx/...
const BASE = '/journalfx';

app.use(`${BASE}/auth`, authRouter);
app.use(`${BASE}/trades`, tradesRouter);
app.use(`${BASE}/targets`, targetsRouter);
app.use(`${BASE}/dashboard`, dashboardRouter);

app.get(`${BASE}/health`, (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`JournalFX API running on http://localhost:${PORT}`);
});
