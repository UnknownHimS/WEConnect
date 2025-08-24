const API_URL = 'https://weconnectb.onrender.com';  // Update this after deploying backend

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return;

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Login successful! Redirecting...');
    window.location.href = data.redirectUrl;  // Redirect based on role
  } else {
    alert(data.message);  // Show login error message
  }
});

// Handle adding visitor name
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();const express = require('express');
const { Client } = require('pg');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Connect to PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Store visitor name
app.post('/api/visitor', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Visitor name is required' });

  try {
    await client.query('INSERT INTO visitors (name) VALUES ($1)', [name]);
    res.json({ message: 'Visitor added successfully' });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ message: 'Failed to add visitor' });
  }
});

// Staff login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

  let role;
  let redirectUrl;

  if (password === process.env.CEO_PASS) {
    role = 'CEO';
    redirectUrl = process.env.REDIRECT_URL_CEO;
  } else if (password === process.env.MANAGER) {
    role = 'Manager';
    redirectUrl = process.env.REDIRECT_URL_MANAGER;
  } else if (password === process.env.ARTIST) {
    role = 'Artist';
    redirectUrl = process.env.REDIRECT_URL_ARTIST;
  } else if (password === process.env.REPORTER) {
    role = 'Reporter';
    redirectUrl = process.env.REDIRECT_URL_REPORTER;
  } else {
    return res.status(401).json({ message: 'Invalid role password' });
  }

  // Optional: save login for analytics (if you want)
  console.log(`✅ ${role} logged in as ${username}`);

  res.json({ message: 'Login

