const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: [true, 'Please provide a rank'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a game name'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
