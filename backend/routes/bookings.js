const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

// POST /api/bookings - Create a booking
router.post('/', authMiddleware, async (req, res) => {
  const { coach_id, booking_date } = req.body;

  try {
    const newBooking = await pool.query(
      'INSERT INTO bookings (student_id, coach_id, booking_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, coach_id, booking_date, 'pending']
    );
    res.status(201).json(newBooking.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings - Fetch bookings for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await pool.query(
      'SELECT * FROM bookings WHERE student_id = $1 OR coach_id = $1',
      [req.user.id]
    );
    res.status(200).json(bookings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;