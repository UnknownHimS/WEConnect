require('dotenv').config({ path: __dirname + '/mine.env.env' });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const CEO_PASS = process.env.CEO_PASS;
const MANAGER = process.env.MANAGER;
const ARTIST  = process.env.ARTIST;
const REPORTER = process.env.REPORTER;
const LOGIN_ROUTE = process.env.LOGIN_ROUTE || '/login';

// Serve the HTML file directly
app.use(express.static(path.join(__dirname)));

app.use(bodyParser.urlencoded({ extended: false }));

app.post(LOGIN_ROUTE, (req, res) => {
  const enteredPassword = req.body.password;

  if (enteredPassword === CEO_PASS) {
    res.redirect('/mndex.html');
  } else {
    res.send('<h2>❌ Access denied</h2>');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



