const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const mockUsers = require('./mock-users');

const router = express.Router();
const canUseFallback = process.env.NODE_ENV !== 'production' || process.env.ALLOW_AUTH_FALLBACK === 'true';
const fallbackUsers = [...mockUsers];
let nextFallbackId = fallbackUsers.reduce((max, user) => Math.max(max, user.id), 0) + 1;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isStrongPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 72;
}

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8 to 72 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [normalizedEmail, hash]
    );

    return res.status(201).json({
      id: result.insertId,
      email: normalizedEmail
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    if (canUseFallback) {
      const existing = fallbackUsers.find((user) => user.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const newUser = {
        id: nextFallbackId++,
        email: normalizedEmail,
        password
      };
      fallbackUsers.push(newUser);

      return res.status(201).json({
        id: newUser.id,
        email: newUser.email
      });
    }

    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8 to 72 characters' });
  }

  try {
    const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [normalizedEmail]);

    if (!rows.length) {
      if (canUseFallback) {
        const fallbackUser = fallbackUsers.find((user) => user.email === normalizedEmail && user.password === password);
        if (fallbackUser) {
          const token = issueToken(fallbackUser);
          return res.json({
            token,
            user: { id: fallbackUser.id, email: fallbackUser.email }
          });
        }
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = issueToken(user);

    return res.json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    if (canUseFallback) {
      const fallbackUser = fallbackUsers.find((user) => user.email === normalizedEmail && user.password === password);
      if (fallbackUser) {
        const token = issueToken(fallbackUser);
        return res.json({
          token,
          user: { id: fallbackUser.id, email: fallbackUser.email }
        });
      }
    }

    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
