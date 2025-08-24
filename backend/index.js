const express = require('express');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables
const cors = require('cors'); // Enable CORS support

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // For parsing JSON requests
app.use(cors()); // Enable CORS

// Connect to PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// POST Route to add Visitor's name
app.post('/api/visitor', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({ message: 'Visitor name is required' });
  }

  try {
    const query = 'INSERT INTO visitors (name) VALUES ($1)';
    await client.query(query, [name]);
    res.status(200).send({ message: 'Visitor name added successfully' });
  } catch (error) {
    console.error('Error adding visitor:', error);
    res.status(500).send({ message: 'Error adding visitor' });
  }
});

// Login Route: Validate username and password (role-based)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send({ message: 'Username and password are required' });

  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(404).send({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).send({ message: 'Invalid credentials' });

    let redirectUrl = '';
    switch (user.role) {
      case 'CEO':
        redirectUrl = process.env.REDIRECT_URL_CEO;
        break;
      case 'Manager':
        redirectUrl = process.env.REDIRECT_URL_MANAGER;
        break;
      case 'Artist':
        redirectUrl = process.env.REDIRECT_URL_ARTIST;
        break;
      case 'Reporter':
        redirectUrl = process.env.REDIRECT_URL_REPORTER;
        break;
      default:
        return res.status(403).send({ message: 'Role not recognized' });
    }

    res.json({ message: 'Login successful!', redirectUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
