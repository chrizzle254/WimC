const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'database', // Service name in docker-compose
  port: 5432,
  database: process.env.DB_NAME,
});

module.exports = pool;