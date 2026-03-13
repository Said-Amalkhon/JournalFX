const express = require('express');
const router = express.Router();
const db = require('../db');

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// GET current week target
router.get('/current', (req, res) => {
  try {
    const weekStart = getWeekStart();
    const target = db.prepare('SELECT * FROM weekly_targets WHERE week_start_date = ?').get(weekStart);
    res.json(target || { target_amount: 0, week_start_date: weekStart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all targets history
router.get('/', (req, res) => {
  try {
    const targets = db.prepare('SELECT * FROM weekly_targets ORDER BY week_start_date DESC').all();
    res.json(targets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST set weekly target (upsert)
router.post('/', (req, res) => {
  const { target_amount, week_start_date } = req.body;
  if (!target_amount) return res.status(400).json({ error: 'target_amount is required' });

  const weekStart = week_start_date || getWeekStart();

  try {
    db.prepare(`
      INSERT INTO weekly_targets (week_start_date, target_amount)
      VALUES (?, ?)
      ON CONFLICT(week_start_date) DO UPDATE SET target_amount = excluded.target_amount
    `).run(weekStart, target_amount);

    const target = db.prepare('SELECT * FROM weekly_targets WHERE week_start_date = ?').get(weekStart);
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
