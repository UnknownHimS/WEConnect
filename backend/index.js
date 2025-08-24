require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../frontend')));

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

// LOGIN ROUTE
app.post(LOGIN_ROUTE, (req, res) => {
  const { password } = req.body;
  console.log('Login attempt:', password);

  const role = roles[password];
  console.log('Matched role:', role);

  if (role) {
    // If the role is 'ceo', redirect to the CEO dashboard
    if (role === 'ceo') {
      return res.redirect('/mceo-dashboard.html');
    }
    else if (role === 'manager') {
      return res.redirect('/mmanager-dashboard.html');
    }
    else if (role === 'artist') {
      return res.redirect('/martist-dashboard.html');
    }
    else if (role === 'reporter') {
      return res.redirect('/mreporter-dashboard.html');
    }

    // Otherwise, redirect to the generic roles page
    return res.redirect(`/roles.html?role=${role}`);
  }

  // If no role matches
  res.status(401).send('<h2>❌ Access denied</h2>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
