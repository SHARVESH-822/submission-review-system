const express = require('express');
const { register, login, forgotPassword, updatePassword } = require('./auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', updatePassword);

module.exports = router;
