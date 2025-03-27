const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db'); // PostgreSQL connection pool
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/register
router.post('/register', async (req, res) => {
  // Get the data from the request body
  const { name, email, password, role } = req.body;

  // Step 1: Validate Input
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  // Validate "role" (must be coach or student)
  if (!['coach', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    // Step 2: Check if the email already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Step 3: Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Save the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );

    // Step 5: Return the created user (excluding the password)
    res.status(201).json({
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      created_at: newUser.rows[0].created_at,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Step 1: Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
  
    try {
      // Step 2: Check if the user exists in the database
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const user = userResult.rows[0];
  
      // Step 3: Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Step 4: Generate JWT
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
  
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Step 5: Send JWT in response
      res.status(200).json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;