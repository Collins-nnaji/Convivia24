const mongoose = require('mongoose');

const HangoutRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    trim: true,
    maxlength: [100, 'Room name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'lounge', 'private'],
    default: 'event'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  currentParticipants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    enablePolls: {
      type: Boolean,
      default: true
    },
    enablePredictions: {
      type: Boolean,
      default: true
    },
    enableReactions: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
HangoutRoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HangoutRoom', HangoutRoomSchema);
