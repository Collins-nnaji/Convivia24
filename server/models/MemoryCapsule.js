const mongoose = require('mongoose');

const MemoryCapsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a memory title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  hangoutRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HangoutRoom',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  highlights: [{
    timestamp: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    media: [{
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    }],
    url: {
      type: String,
      required: true
    }
  }],
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    totalPolls: {
      type: Number,
      default: 0
    },
    totalPredictions: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // in minutes
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MemoryCapsule', MemoryCapsuleSchema);
