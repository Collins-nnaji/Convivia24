const HangoutRoom = require('../models/HangoutRoom');
const Event = require('../models/Event');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all hangout rooms
// @route   GET /api/hangout-rooms
// @access  Public
exports.getHangoutRooms = asyncHandler(async (req, res, next) => {
  const { type, isActive, eventId } = req.query;
  
  let query = {};
  
  if (type) query.type = type;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (eventId) query.event = eventId;
  
  const rooms = await HangoutRoom.find(query)
    .populate('event', 'title date location')
    .populate('host', 'name profilePicture')
    .populate('currentParticipants.user', 'name profilePicture isOnline')
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms
  });
});

// @desc    Get single hangout room
// @route   GET /api/hangout-rooms/:id
// @access  Public
exports.getHangoutRoom = asyncHandler(async (req, res, next) => {
  const room = await HangoutRoom.findById(req.params.id)
    .populate('event', 'title date location description image')
    .populate('host', 'name profilePicture socialProfile.bio')
    .populate('moderators', 'name profilePicture')
    .populate('currentParticipants.user', 'name profilePicture isOnline lastSeen');
    
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Create new hangout room
// @route   POST /api/hangout-rooms
// @access  Private
exports.createHangoutRoom = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.host = req.user.id;
  
  // Check if event exists
  const event = await Event.findById(req.body.event);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  const room = await HangoutRoom.create(req.body);
  
  // Update event with hangout room reference
  await Event.findByIdAndUpdate(req.body.event, {
    hangoutRoom: room._id
  });
  
  // Add host as first participant
  await HangoutRoom.findByIdAndUpdate(room._id, {
    $push: {
      currentParticipants: {
        user: req.user.id,
        joinedAt: new Date(),
        isOnline: true
      }
    }
  });
  
  const populatedRoom = await HangoutRoom.findById(room._id)
    .populate('event', 'title date location')
    .populate('host', 'name profilePicture')
    .populate('currentParticipants.user', 'name profilePicture isOnline');
  
  res.status(201).json({
    success: true,
    data: populatedRoom
  });
});

// @desc    Join hangout room
// @route   POST /api/hangout-rooms/:id/join
// @access  Private
exports.joinHangoutRoom = asyncHandler(async (req, res, next) => {
  const room = await HangoutRoom.findById(req.params.id);
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  if (!room.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Hangout room is not active'
    });
  }
  
  // Check if user is already in the room
  const existingParticipant = room.currentParticipants.find(
    p => p.user.toString() === req.user.id
  );
  
  if (existingParticipant) {
    // Update online status
    existingParticipant.isOnline = true;
    existingParticipant.joinedAt = new Date();
    await room.save();
  } else {
    // Check room capacity
    if (room.currentParticipants.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Hangout room is at full capacity'
      });
    }
    
    // Add user to room
    room.currentParticipants.push({
      user: req.user.id,
      joinedAt: new Date(),
      isOnline: true
    });
    await room.save();
  }
  
  // Update user's online status
  await User.findByIdAndUpdate(req.user.id, {
    isOnline: true,
    lastSeen: new Date()
  });
  
  const updatedRoom = await HangoutRoom.findById(req.params.id)
    .populate('currentParticipants.user', 'name profilePicture isOnline');
  
  res.status(200).json({
    success: true,
    data: updatedRoom
  });
});

// @desc    Leave hangout room
// @route   POST /api/hangout-rooms/:id/leave
// @access  Private
exports.leaveHangoutRoom = asyncHandler(async (req, res, next) => {
  const room = await HangoutRoom.findById(req.params.id);
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  // Remove user from room
  room.currentParticipants = room.currentParticipants.filter(
    p => p.user.toString() !== req.user.id
  );
  
  await room.save();
  
  // Update user's online status
  await User.findByIdAndUpdate(req.user.id, {
    isOnline: false,
    lastSeen: new Date()
  });
  
  res.status(200).json({
    success: true,
    message: 'Left hangout room successfully'
  });
});

// @desc    Update hangout room
// @route   PUT /api/hangout-rooms/:id
// @access  Private
exports.updateHangoutRoom = asyncHandler(async (req, res, next) => {
  let room = await HangoutRoom.findById(req.params.id);
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  // Make sure user is room host or moderator
  if (room.host.toString() !== req.user.id && !room.moderators.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this hangout room'
    });
  }
  
  room = await HangoutRoom.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Delete hangout room
// @route   DELETE /api/hangout-rooms/:id
// @access  Private
exports.deleteHangoutRoom = asyncHandler(async (req, res, next) => {
  const room = await HangoutRoom.findById(req.params.id);
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  // Make sure user is room host
  if (room.host.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this hangout room'
    });
  }
  
  await room.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Hangout room deleted successfully'
  });
});
