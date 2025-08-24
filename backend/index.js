const express = require('express');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());  // For cross-origin requests

// Connect to PostgreSQL using Render's DATABASE_URL from the .env file
const client = new Client({
  connectionString: process.env.DATABASE_URL,  // Database URL from .env
  ssl: { rejectUnauthorized: false },  // Enable SSL for secure connection
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Login Route: Validate role and password
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username and password are required');

  try {
    // Check if user exists in the database
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(404).send('User not found');

    // Check password based on role
    let validPassword = false;
    switch (user.role) {
      case 'CEO':
        validPassword = password === process.env.CEO_PASS;
        break;
      case 'Manager':
        validPassword = password === process.env.MANAGER;
        break;
      case 'Artist':
        validPassword = password === process.env.ARTIST;
        break;
      case 'Reporter':
        validPassword = password === process.env.REPORTER;
        break;
      default:
        return res.status(403).send('Role not recognized');
    }

    if (!validPassword) return res.status(401).send('Invalid credentials');

    // Role-based redirect URL
    let redirectUrl;
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
        return res.status(403).send('Role not recognized');
    }

    // Send success response with redirect URL
    res.json({ message: 'Login successful!', redirectUrl });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});

// Second Password Route for dashboard access (after redirect)
app.post('/verify-second-password', (req, res) => {
  const { role, secondPassword } = req.body;
  let validSecondPassword = false;

  // Validate second password based on role
  switch (role) {
    case 'CEO':
      validSecondPassword = secondPassword === process.env.CEO_PASS;
      break;
    case 'Manager':
      validSecondPassword = secondPassword === process.env.MANAGER;
      break;
    case 'Artist':
      validSecondPassword = secondPassword === process.env.ARTIST;
      break;
    case 'Reporter':
      validSecondPassword = secondPassword === process.env.REPORTER;
      break;
    default:
      return res.status(403).send('Role not recognized');
  }

  if (validSecondPassword) {
    return res.json({ message: 'Password verified! Access granted.' });
  } else {
    return res.status(401).send('Invalid second password');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
