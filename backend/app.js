const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); 
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json()); // Parses JSON request bodies
app.use(cors());

// Example route for testing
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api', authRoutes); 
app.use('/api', userRoutes); 

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});