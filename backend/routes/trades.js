const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all trades
router.get('/', (req, res) => {
  const { filter, limit } = req.query;
  try {
    let query = 'SELECT * FROM trades';
    const params = [];

    if (filter === 'profit' || filter === 'loss') {
      query += ' WHERE result_type = ?';
      params.push(filter);
    }
    query += ' ORDER BY trade_date DESC, created_at DESC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const trades = db.prepare(query).all(...params);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trade
router.get('/:id', (req, res) => {
  try {
    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create trade
router.post('/', (req, res) => {
  const { instrument, side, amount, result_type, note, reason_tag, mood_tag, trade_date } = req.body;
  if (!instrument || !side || !amount || !result_type || !trade_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const stmt = db.prepare(`
      INSERT INTO trades (instrument, side, amount, result_type, note, reason_tag, mood_tag, trade_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(instrument, side, amount, result_type, note || '', reason_tag || '', mood_tag || '', trade_date);
    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update trade
router.put('/:id', (req, res) => {
  const { instrument, side, amount, result_type, note, reason_tag, mood_tag, trade_date } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM trades WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Trade not found' });

    db.prepare(`
      UPDATE trades SET
        instrument = ?, side = ?, amount = ?, result_type = ?,
        note = ?, reason_tag = ?, mood_tag = ?, trade_date = ?
      WHERE id = ?
    `).run(
      instrument ?? existing.instrument,
      side ?? existing.side,
      amount ?? existing.amount,
      result_type ?? existing.result_type,
      note ?? existing.note,
      reason_tag ?? existing.reason_tag,
      mood_tag ?? existing.mood_tag,
      trade_date ?? existing.trade_date,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM trades WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE trade
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM trades WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Trade not found' });
    res.json({ message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
