const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a prediction title'],
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a prediction description'],
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Option text cannot be more than 100 characters']
    },
    odds: {
      type: Number,
      required: true,
      min: 1.01
    },
    bets: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: {
        type: Number,
        required: true,
        min: 1
      },
      placedAt: {
        type: Date,
        default: Date.now
      }
    }],
    totalBets: {
      type: Number,
      default: 0
    }
  }],
  hangoutRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HangoutRoom',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['sports', 'entertainment', 'general', 'event-specific'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  result: {
    winningOption: {
      type: Number,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    isResolved: {
      type: Boolean,
      default: false
    }
  },
  totalBets: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
