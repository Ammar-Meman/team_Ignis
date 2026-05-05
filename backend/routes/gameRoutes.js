const express = require('express');
const router = express.Router();
const { getGames, setGames } = require('../controllers/gameController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public — anyone can view active games
router.get('/', getGames);

// Private — only grandmaster can update games
router.put('/', protect, adminOnly, setGames);

module.exports = router;
