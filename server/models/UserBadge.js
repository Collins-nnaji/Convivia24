const mongoose = require('mongoose');

const UserBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    current: {
      type: Number,
      default: 0
    },
    required: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  isDisplayed: {
    type: Boolean,
    default: true
  }
});

// Ensure unique combination of user and badge
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', UserBadgeSchema);
