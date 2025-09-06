const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a poll question'],
    trim: true,
    maxlength: [200, 'Question cannot be more than 200 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Option text cannot be more than 100 characters']
    },
    votes: {
      type: Number,
      default: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
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
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', PollSchema);
