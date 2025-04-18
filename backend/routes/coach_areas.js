const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

// GET /api/coach-areas - Get all coach availability areas
router.get('/coach-areas', async (req, res) => {
  try {
    const areas = await pool.query(`
      SELECT 
        ca.*,
        u.name as coach_name,
        u.email as coach_email
      FROM coach_availability_areas ca
      JOIN users u ON ca.coach_id = u.id
      WHERE u.role = 'coach'
    `);
    res.status(200).json(areas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coach-areas - Create a new availability area
router.post('/coach-areas', authMiddleware, async (req, res) => {
  const { area_type, center_lat, center_lng, radius, coordinates, start_time, end_time, day_of_week } = req.body;
  
  try {
    // Verify user is a coach
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0].role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can create availability areas' });
    }

    // Prepare the coordinates for polygon type
    let coordinatesJson = null;
    if (area_type === 'polygon' && coordinates) {
      coordinatesJson = JSON.stringify(coordinates);
    }

    const newArea = await pool.query(
      `INSERT INTO coach_availability_areas 
       (coach_id, area_type, center_lat, center_lng, radius, coordinates, start_time, end_time, day_of_week)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        area_type,
        area_type === 'circle' ? center_lat : null,
        area_type === 'circle' ? center_lng : null,
        area_type === 'circle' ? radius : null,
        coordinatesJson,
        start_time,
        end_time,
        day_of_week
      ]
    );
    res.status(201).json(newArea.rows[0]);
  } catch (err) {
    console.error('Error creating area:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/coach-areas/:id - Update an availability area
router.put('/coach-areas/:id', authMiddleware, async (req, res) => {
  const { area_type, center_lat, center_lng, radius, coordinates, start_time, end_time, day_of_week } = req.body;
  
  try {
    // Verify user owns the area
    const area = await pool.query('SELECT coach_id FROM coach_availability_areas WHERE id = $1', [req.params.id]);
    if (area.rows[0].coach_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this area' });
    }

    const updatedArea = await pool.query(
      `UPDATE coach_availability_areas 
       SET area_type = $1, center_lat = $2, center_lng = $3, radius = $4, 
           coordinates = $5, start_time = $6, end_time = $7, day_of_week = $8
       WHERE id = $9 AND coach_id = $10
       RETURNING *`,
      [area_type, center_lat, center_lng, radius, coordinates, start_time, end_time, day_of_week, req.params.id, req.user.id]
    );
    res.status(200).json(updatedArea.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/coach-areas/:id - Delete an availability area
router.delete('/coach-areas/:id', authMiddleware, async (req, res) => {
  try {
    // Verify user owns the area
    const area = await pool.query('SELECT coach_id FROM coach_availability_areas WHERE id = $1', [req.params.id]);
    if (area.rows[0].coach_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this area' });
    }

    await pool.query('DELETE FROM coach_availability_areas WHERE id = $1 AND coach_id = $2', [req.params.id, req.user.id]);
    res.status(200).json({ message: 'Area deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 