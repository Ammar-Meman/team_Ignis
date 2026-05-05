const Game = require('../models/Game');

// @desc    Get all games (public — anyone can view)
// @route   GET /api/games
// @access  Public
const getGames = async (req, res) => {
  try {
    const games = await Game.find({}).sort({ rank: 1 });
    res.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error fetching games' });
  }
};

// @desc    Replace all games (Grandmaster sets the active modules)
// @route   PUT /api/games
// @access  Private (Grandmaster only)
const setGames = async (req, res) => {
  try {
    const { games } = req.body;

    if (!Array.isArray(games)) {
      return res.status(400).json({ message: 'Games must be an array' });
    }

    // Validate each game has rank and name
    for (const game of games) {
      if (!game.name || typeof game.name !== 'string' || !game.name.trim()) {
        return res.status(400).json({ message: 'Each game must have a valid name' });
      }
      if (typeof game.rank !== 'number' || game.rank < 1) {
        return res.status(400).json({ message: 'Each game must have a valid rank' });
      }
    }

    // Clear existing games and insert the new list
    await Game.deleteMany({});
    const created = await Game.insertMany(
      games.map(g => ({ rank: g.rank, name: g.name.trim() }))
    );

    res.json(created);
  } catch (error) {
    console.error('Set games error:', error);
    res.status(500).json({ message: 'Server error saving games' });
  }
};

module.exports = { getGames, setGames };
