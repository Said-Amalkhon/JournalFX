const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const CODE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function makeToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) return res.status(409).json({ error: 'Username or email already taken' });

  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hash);
  const user = { id: result.lastInsertRowid, username };
  res.json({ token: makeToken(user), username });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { login, password } = req.body; // login = username or email
  if (!login || !password) return res.status(400).json({ error: 'All fields required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: makeToken(user), username: user.username });
});

// POST /auth/forgot-password  — sends 6-digit code
router.post('/forgot-password', async (req, res) => {
  const { login } = req.body;
  if (!login) return res.status(400).json({ error: 'Email or username required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
  // Always respond OK to prevent user enumeration
  if (!user) return res.json({ ok: true });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  // Invalidate old codes
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0').run(user.id);
  db.prepare('INSERT INTO password_reset_tokens (user_id, code, expires_at) VALUES (?, ?, ?)').run(user.id, code, expiresAt);

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'JournalFX — Password Reset Code',
      text: `Your password reset code is: ${code}\n\nThis code expires in 3 minutes.`,
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 3 minutes.</p>`,
    });
  } catch (err) {
    console.error('SMTP error:', err.message);
    // Don't leak SMTP config issues to client in prod; still return ok
  }

  res.json({ ok: true });
});

// POST /auth/verify-code
router.post('/verify-code', (req, res) => {
  const { login, code } = req.body;
  if (!login || !code) return res.status(400).json({ error: 'login and code required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
  if (!user) return res.status(400).json({ error: 'Invalid code' });

  const row = db.prepare(
    'SELECT * FROM password_reset_tokens WHERE user_id = ? AND code = ? AND used = 0 ORDER BY id DESC LIMIT 1'
  ).get(user.id, code);

  if (!row) return res.status(400).json({ error: 'Invalid code' });
  if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });

  // Issue a short-lived reset token (we reuse JWT, scoped for reset only)
  const resetToken = jwt.sign({ sub: user.id, purpose: 'reset', tokenId: row.id }, JWT_SECRET, { expiresIn: '10m' });
  res.json({ resetToken });
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { resetToken, password } = req.body;
  if (!resetToken || !password) return res.status(400).json({ error: 'resetToken and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  let payload;
  try {
    payload = jwt.verify(resetToken, JWT_SECRET);
  } catch {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  if (payload.purpose !== 'reset') return res.status(400).json({ error: 'Invalid token' });

  // Mark code as used
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(payload.tokenId);

  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, payload.sub);

  res.json({ ok: true });
});

// GET /auth/profile
router.get('/profile', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /auth/profile — update email and/or avatar
router.put('/profile', requireAuth, (req, res) => {
  const { email, avatar } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newEmail = email || user.email;
  if (email && email !== user.email) {
    const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (taken) return res.status(409).json({ error: 'Email already taken' });
  }

  db.prepare('UPDATE users SET email = ?, avatar = ? WHERE id = ?').run(
    newEmail,
    avatar !== undefined ? avatar : user.avatar,
    req.user.id
  );

  const updated = db.prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

// PUT /auth/change-password
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ ok: true });
});

module.exports = router;
