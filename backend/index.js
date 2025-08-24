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
app.use('../frontend', express.static(path.join(__dirname, '../backend')));

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

// Read the URLs from the environment variables
const redirectUrls = {
  ceo: process.env.REDIRECT_URL_CEO,
  manager: process.env.REDIRECT_URL_MANAGER,
  artist: process.env.REDIRECT_URL_ARTIST,
  reporter: process.env.REDIRECT_URL_REPORTER,
};

// LOGIN ROUTE
app.post(LOGIN_ROUTE, (req, res) => {
  const { password } = req.body;
  console.log('Login attempt with password:', password);

  const role = roles[password];
  console.log('Matched role:', role);

  if (role) {
    const redirectUrl = redirectUrls[role];

    // Ensure the redirect URL exists for the matched role
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    // If no valid redirect URL is found, redirect to a generic page
    return res.redirect(`/roles.html?role=${role}`);
  }

  // If no role matches, deny access
  res.status(401).send('<h2>❌ Access denied</h2>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
