require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const path = require('path');
const ejsMate = require('ejs-mate');

const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('../utils/expressError');

const sessionConfig = require('../config/session');

const manualAuthRoutes = require('../routes/manualAuth');
const userRoutes  = require('../routes/user');
const googleRoutes = require('../routes/google');

const tokenManager = require('../utils/tokenManager');

// Make it available to all routes
app.set('tokenManager', tokenManager);

app.use(express.json());

app.use(session(sessionConfig));
app.use(flash());

app.use(express.urlencoded());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.currentUser = req.user;
  next();
});

// Home Route
app.get('/', async (req, res) => {
  console.log(req.user);
  res.render('home', { user: req.user });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.use('/', manualAuthRoutes);
app.use('/', userRoutes);
app.use('/', googleRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});