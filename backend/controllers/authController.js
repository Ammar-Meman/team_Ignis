const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const fs = require('fs');
const path = require('path');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { grNo, password } = req.body;

    // Check for user
    const user = await User.findOne({ grNo }).select('+password');

    if (user && (await user.matchPassword(password))) {
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
      password: '123456', // Fixed password for all Embers as requested
      role: 'ember'
    }));

    // Add the Grand Master (Admin) to the list
    formattedUsers.push({
      grNo: 'ADMIN01',
      name: 'Grand Master',
      password: '123456', // Or 'adminpassword123', keeping it 123456 for simplicity as requested
      role: 'grandmaster'
    });

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
