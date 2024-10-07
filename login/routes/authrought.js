const express = require('express');
const { register, login } = require('../controllers/authcontroller');
const router = express.Router();

// POST request for user registration
router.post('/register', register);

// POST request for user login
router.post('/login', login);

module.exports = router;
