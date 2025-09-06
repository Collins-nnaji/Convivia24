const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a badge name'],
    trim: true,
    maxlength: [50, 'Badge name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a badge description'],
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  icon: {
    type: String,
    required: [true, 'Please add a badge icon']
  },
  category: {
    type: String,
    enum: ['host', 'predictor', 'social', 'achievement', 'special'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  requirements: {
    type: {
      type: String,
      enum: ['events_hosted', 'predictions_made', 'correct_predictions', 'social_interactions', 'loyalty_points', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['lifetime', 'monthly', 'weekly', 'daily'],
      default: 'lifetime'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);
