require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Express's built-in JSON parser
app.use(express.urlencoded({ extended: false })); // Express's built-in URL-encoded parser

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
    res.sendFile(path.join(__dirname, 'mceo-dashboard.html')); // Serve the CEO dashboard
  } else {
    res.status(403).send('<h2>❌ Forbidden: Invalid access</h2>');
  }
});

// Similarly, for other roles
app.get('/mmanager-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role === 'manager') {
    res.sendFile(path.join(__dirname, 'mmanager-dashboard.html'));
  } else {
    res.status(403).send('<h2>❌ Forbidden: Invalid access</h2>');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
