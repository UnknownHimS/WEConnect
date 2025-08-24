require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Express's built-in JSON parser
app.use(express.urlencoded({ extended: false })); // Express's built-in URL-encoded parser
app.use('../backend', express.static(path.join(__dirname, '../frontend')));

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

// Predefined redirect URLs
const redirectUrls = {
  ceo: '/mceo-dashboard.html',
  manager: '/mmanager-dashboard.html',
  artist: '/martist-dashboard.html',
  reporter: '/mreporter-dashboard.html',
};

// JWT secret for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// LOGIN ROUTE
app.post(LOGIN_ROUTE, (req, res) => {
  const { password } = req.body;
  console.log('Login attempt:', password);

  const role = roles[password];
  console.log('Matched role:', role);

  if (role) {
    // Generate JWT token
    const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: '1h' });

    // Send token to the client (set as a cookie or in the response body)
    res.cookie('auth_token', token, { httpOnly: true, secure: true }); // secure flag for HTTPS
    return res.redirect(redirectUrls[role]);
  }

  res.status(401).send('<h2>❌ Access denied</h2>');
});

// Middleware to verify JWT for protected routes
const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send('<h2>❌ Unauthorized</h2>');
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('<h2>❌ Invalid token</h2>');
    }
    req.user = decoded; // attach the user role to the request
    next();
  });
};

// Protected Routes
app.get('/mceo-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role !== 'ceo') {
    return res.status(403).send('<h2>❌ Forbidden</h2>');
  }
  res.sendFile(path.join(__dirname, 'mceo-dashboard.html'));
});

app.get('/mmanager-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).send('<h2>❌ Forbidden</h2>');
  }
  res.sendFile(path.join(__dirname, 'mmanager-dashboard.html'));
});

// Similar protected routes for artist and reporter
app.get('/martist-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role !== 'artist') {
    return res.status(403).send('<h2>❌ Forbidden</h2>');
  }
  res.sendFile(path.join(__dirname, 'martist-dashboard.html'));
});

app.get('/mreporter-dashboard.html', verifyToken, (req, res) => {
  if (req.user.role !== 'reporter') {
    return res.status(403).send('<h2>❌ Forbidden</h2>');
  }
  res.sendFile(path.join(__dirname, 'mreporter-dashboard.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
