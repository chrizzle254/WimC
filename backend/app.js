const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(bodyParser.json()); // Parses JSON request bodies

// Example route for testing
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api', authRoutes); // Add `/api/register` route from auth.js

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});