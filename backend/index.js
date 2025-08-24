// Load env variables
require('dotenv').config({ path: __dirname + '/postgre.env' });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create users table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );
`).catch(console.error);

// Your existing user routes:

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// === New role-password map (hardcoded for demo) ===
const rolePasswords = {
  ceo: "ceo-secret",
  manager: "manager-secret",
  reporter: "reporter-secret",
  artist: "artist-secret"
};

// Login endpoint
app.post('/login', (req, res) => {
  const { role, password } = req.body;

  if (!rolePasswords[role]) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (rolePasswords[role] === password) {
    return res.json({ message: "Login successful", role });
  } else {
    return res.status(401).json({ error: "Incorrect password" });
  }
});

// Middleware to authorize roles (using query param role)
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.query.role === role) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Access denied" });
    }
  };
}

// Example manager protected route, fetching users from DB
app.get('/manager/data', authorizeRole('manager'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json({
      message: "Manager Dashboard Data",
      users: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reporter example route
app.get('/reporter/data', authorizeRole('reporter'), (req, res) => {
  res.json({ message: "Reporter Dashboard Data" });
});

// Add other role routes as needed...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
