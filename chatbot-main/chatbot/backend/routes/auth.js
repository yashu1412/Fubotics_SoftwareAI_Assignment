const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;