const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

router.get('/coaches', async (req, res) => {
    try {
      const coaches = await pool.query("SELECT id, name, email FROM users WHERE role = 'coach'");
      return res.status(200).json(coaches.rows);
    } catch (err) {
      console.error('Error fetching coaches:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
  });

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await pool.query('SELECT id, name, email, role FROM users');
        return res.status(200).json(users.rows);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Get a single user by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Update a user
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Input validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        if (typeof name !== 'string' || typeof email !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        console.log('Attempting to update user:', { id, name, email });
        
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            console.log('User not found:', id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        const emailExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND id != $2',
            [email, id]
        );
        if (emailExists.rows.length > 0) {
            console.log('Email already taken:', email);
            return res.status(400).json({ message: 'Email is already taken' });
        }
        
        // Update user
        const updatedUser = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
        
        console.log('User updated successfully:', updatedUser.rows[0]);
        return res.status(200).json(updatedUser.rows[0]);
    } catch (err) {
        console.error('Detailed error updating user:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            stack: err.stack
        });
        
        // Check for specific database errors
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Email is already taken' });
        }
        if (err.code === '23514') { // Check violation
            return res.status(400).json({ message: 'Invalid input data' });
        }
        return res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;