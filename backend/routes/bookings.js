const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

// POST /api/bookings - Create a booking
router.post('/bookings', authMiddleware, async (req, res) => {
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
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, u.name as student_name, c.name as coach_name 
       FROM bookings b 
       JOIN users u ON b.student_id = u.id 
       JOIN users c ON b.coach_id = c.id 
       WHERE b.student_id = $1 OR b.coach_id = $1`,
      [req.user.id]
    );
    res.status(200).json(bookings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/bookings/:id/status - Update booking status (accept/decline)
router.patch('/bookings/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "declined".' });
  }

  try {
    // Verify that the logged-in user is the coach for this booking
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND coach_id = $2',
      [id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(403).json({ 
        message: 'You are not authorized to update this booking or booking does not exist'
      });
    }

    // Update the booking status
    const updatedBooking = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(updatedBooking.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;