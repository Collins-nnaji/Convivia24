const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a game name'],
    trim: true,
    maxlength: [100, 'Game name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a game description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['trivia', 'prediction_battle', 'drinking_game', 'party_game', 'custom'],
    required: true
  },
  hangoutRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HangoutRoom',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    maxParticipants: {
      type: Number,
      default: 10
    },
    duration: {
      type: Number, // in minutes
      default: 15
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    allowSpectators: {
      type: Boolean,
      default: true
    }
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: Number,
    points: {
      type: Number,
      default: 10
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'completed', 'cancelled'],
    default: 'waiting'
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', GameSchema);
