const express = require('express');
const router = express.Router();
const { loginUser, seedUsers } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/seed', seedUsers); // Keep this for easy setup/testing

module.exports = router;
