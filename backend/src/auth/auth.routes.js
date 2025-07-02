const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
// Add OAuth and 2FA routes here in the future

module.exports = router;
