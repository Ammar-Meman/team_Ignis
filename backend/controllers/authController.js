const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const fs = require('fs');
const path = require('path');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { grNo, password, role } = req.body;

    // Check for user
    const user = await User.findOne({ grNo }).select('+password');

    // Verify user exists, password matches, AND requested role matches their actual database role
    if (user && (await user.matchPassword(password))) {
      // If the user tries to log in as a role they do not have, reject them
      if (role && user.role !== role) {
        let actualRoleName = user.role === 'grandmaster' ? 'Grand Master' : 'an Ember';
        return res.status(401).json({ message: `Access denied. You are registered as ${actualRoleName}.` });
      }

      res.json({
        _id: user._id,
        grNo: user.grNo,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid GR Number or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Seed initial users
// @route   POST /api/auth/seed
// @access  Public (Should be protected or removed in production)
const seedUsers = async (req, res) => {
  try {
    // Clear existing users to prevent duplicates during testing
    await User.deleteMany({});

    // Read users from JSON file
    const usersPath = path.join(__dirname, '..', 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    // Format all users from JSON file
    const formattedUsers = usersData.map(user => ({
      grNo: user.grNo,
      name: user.name,
      // Passwords are now securely pulled from the .env file instead of being visible in code
      password: user.grNo === '108726' ? process.env.GRANDMASTER_PASSWORD : process.env.DEFAULT_EMBER_PASSWORD,
      // Make Ammar Meman (108726) the Grand Master, everyone else is an ember
      role: user.grNo === '108726' ? 'grandmaster' : 'ember'
    }));

    const createdUsers = await User.create(formattedUsers);

    res.status(201).json({
      message: 'Database seeded with test users successfully',
      count: createdUsers.length,
      users: createdUsers.map(u => ({ grNo: u.grNo, name: u.name, role: u.role })) // Don't send back passwords
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Server error during seeding' });
  }
};

module.exports = {
  loginUser,
  seedUsers
};
