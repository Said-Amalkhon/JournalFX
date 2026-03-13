const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

router.get('/', (req, res) => {
  const uid = req.user.id;
  try {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd(weekStart);

    const totalStats = db.prepare(`
      SELECT
        COUNT(*) as total_trades,
        SUM(CASE WHEN result_type = 'profit' THEN amount ELSE 0 END) as total_profit,
        SUM(CASE WHEN result_type = 'loss' THEN amount ELSE 0 END) as total_loss
      FROM trades WHERE user_id = ?
    `).get(uid);

    const weeklyStats = db.prepare(`
      SELECT
        COUNT(*) as weekly_trades,
        SUM(CASE WHEN result_type = 'profit' THEN amount ELSE 0 END) as weekly_profit,
        SUM(CASE WHEN result_type = 'loss' THEN amount ELSE 0 END) as weekly_loss
      FROM trades
      WHERE user_id = ? AND trade_date >= ? AND trade_date <= ?
    `).get(uid, weekStart, weekEnd);

    const target = db.prepare('SELECT * FROM weekly_targets WHERE user_id = ? AND week_start_date = ?').get(uid, weekStart);

    const recentTrades = db.prepare(`
      SELECT * FROM trades WHERE user_id = ? ORDER BY trade_date DESC, created_at DESC LIMIT 5
    `).all(uid);

    const reasonStats = db.prepare(`
      SELECT reason_tag, result_type, COUNT(*) as count
      FROM trades
      WHERE user_id = ? AND reason_tag != '' AND reason_tag IS NOT NULL
      GROUP BY reason_tag, result_type
      ORDER BY count DESC
    `).all(uid);

    const moodStats = db.prepare(`
      SELECT mood_tag, COUNT(*) as count
      FROM trades
      WHERE user_id = ? AND mood_tag != '' AND mood_tag IS NOT NULL
      GROUP BY mood_tag
      ORDER BY count DESC
    `).all(uid);

    const dailyPnl = db.prepare(`
      SELECT
        trade_date,
        SUM(CASE WHEN result_type = 'profit' THEN amount ELSE -amount END) as net_pnl,
        SUM(CASE WHEN result_type = 'profit' THEN amount ELSE 0 END) as profit,
        SUM(CASE WHEN result_type = 'loss' THEN amount ELSE 0 END) as loss,
        COUNT(*) as trade_count
      FROM trades
      WHERE user_id = ? AND trade_date >= date('now', '-30 days')
      GROUP BY trade_date
      ORDER BY trade_date ASC
    `).all(uid);

    const netPnl = (totalStats.total_profit || 0) - (totalStats.total_loss || 0);
    const weeklyNetPnl = (weeklyStats.weekly_profit || 0) - (weeklyStats.weekly_loss || 0);
    const targetAmount = target?.target_amount || 0;
    const targetProgress = targetAmount > 0 ? Math.min((weeklyNetPnl / targetAmount) * 100, 100) : 0;

    const today = new Date();
    const endOfWeek = new Date(weekEnd);
    const daysLeft = Math.max(0, Math.ceil((endOfWeek - today) / (1000 * 60 * 60 * 24)));

    res.json({
      totalTrades: totalStats.total_trades || 0,
      totalProfit: totalStats.total_profit || 0,
      totalLoss: totalStats.total_loss || 0,
      netPnl,
      weekly: {
        trades: weeklyStats.weekly_trades || 0,
        profit: weeklyStats.weekly_profit || 0,
        loss: weeklyStats.weekly_loss || 0,
        netPnl: weeklyNetPnl,
        targetAmount,
        targetProgress: Math.max(0, targetProgress),
        daysLeft,
        weekStart,
        weekEnd,
      },
      recentTrades,
      reasonStats,
      moodStats,
      dailyPnl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
