const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

router.get('/coaches', async (req, res) => {
    try {
      const coaches = await pool.query("SELECT id, name, email FROM users WHERE role = 'coach'");
      return res.status(200).json(coaches.rows); // Use 'return' to stop further execution
    } catch (err) {
      console.error('Error fetching coaches:', err.message);
      return res.status(500).json({ message: 'Server error' }); // Use 'return' here too
    }
  });

router.get('/users', authMiddleware, async (req, res) => {
    try {
      const users = await pool.query('SELECT id, name, email, role FROM users');
      return res.status(200).json(users.rows); // Add 'return'
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' }); // Add 'return'
    }
  });

module.exports = router;