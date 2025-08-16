const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index');
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Dashboard page
router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;