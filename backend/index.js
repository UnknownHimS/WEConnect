require('dotenv').config({ path: path.resolve(__dirname, '.env') });


const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ensure 'users' table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );
`).catch(console.error);

// Environment role passwords
const LOGIN_ROUTE = process.env.LOGIN_ROUTE || '/login';

const roles = {
  [process.env.CEO_PASS]: 'ceo',
  [process.env.MANAGER]: 'manager',
  [process.env.ARTIST]: 'artist',
  [process.env.REPORTER]: 'reporter',
};

// LOGIN ROUTE
app.post(LOGIN_ROUTE, (req, res) => {
  const { password } = req.body;

  const role = roles[password];
  if (role) {
    return res.redirect(`/roles.html?role=${role}`);
  }

  res.status(401).send('<h2>❌ Access denied</h2>');
});

// API: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add a new user
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
