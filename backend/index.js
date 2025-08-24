require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://weconnectb.onrender.com', // Allow frontend domain
  methods: ['GET', 'POST'], // Allowed methods
  credentials: true, // Allow cookies with requests
}));
app.use(express.json());  // Express's built-in JSON parser
app.use(express.urlencoded({ extended: false })); // Express's built-in URL-encoded parser
app.use(cookieParser());  // To parse cookies for JWT

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Environment role passwords
const LOGIN_ROUTE = process.env.LOGIN_ROUTE || '/login';
const roles = {
  [process.env.CEO_PASS]: 'ceo',
  [process.env.MANAGER]: 'manager',
  [process.env.ARTIST]: 'artist',
  [process.env.REPORTER]: 'reporter',
};

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send('<h2>❌ Unauthorized</h2>');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('<h2>❌ Invalid or expired token</h2>');
    }
    req.user = decoded; // Attach decoded data to the request
    next();
  });
};

// LOGIN ROUTE
app.post(LOGIN_ROUTE, (req, res) => {
  const { password } = req.body;
  console.log('Login attempt with password:', password);

  const role = roles[password];
  console.log('Matched role:', role);

  if (role) {
    // Generate JWT token for the user
    const token = jwt.sign({ role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirect based on the role
    const redirectUrl = process.env[`REDIRECT_URL_${role.toUpperCase()}`];
    return res.redirect(redirectUrl);
  }

  res.status(401).send('<h2>❌ Access denied</h2>');
});

// Protected Route: Dashboard URL
app.get('/mceo-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role === 'ceo') {
    res.sendFile(path.join(__dirname, 'frontend', 'mceo-dashboard.html')); // Serve the CEO dashboard
  } else {
    res.status(403).send('<h2>❌ Forbidden: Invalid access</h2>');
  }
});

// Similarly, for other roles
app.get('/mmanager-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role === 'manager') {
    res.sendFile(path.join(__dirname, 'frontend', 'mmanager-dashboard.html'));
  } else {
    res.status(403).send('<h2>❌ Forbidden: Invalid access</h2>');
  }
});

// API Endpoint to fetch users (you can extend this with user authentication or role-based filtering)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users'); // Query your users from DB
    res.json(result.rows); // Send users as JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint to add a user (this is just an example, you may want to extend this)
app.post('/api/users', verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await pool.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]); // Send back the created user
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files for the frontend (if necessary)
app.use(express.static(path.join(__dirname, 'frontend')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
