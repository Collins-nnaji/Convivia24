const Poll = require('../models/Poll');
const HangoutRoom = require('../models/HangoutRoom');
const asyncHandler = require('../middleware/async');

// @desc    Get polls for a hangout room
// @route   GET /api/polls
// @access  Public
exports.getPolls = asyncHandler(async (req, res, next) => {
  const { hangoutRoomId, isActive } = req.query;
  
  let query = {};
  
  if (hangoutRoomId) query.hangoutRoom = hangoutRoomId;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  const polls = await Poll.find(query)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: polls.length,
    data: polls
  });
});

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Public
exports.getPoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.voters', 'name profilePicture');
    
  if (!poll) {
    return res.status(404).json({
      success: false,
      message: 'Poll not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: poll
  });
});

// @desc    Create new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.creator = req.user.id;
  
  // Check if hangout room exists
  const hangoutRoom = await HangoutRoom.findById(req.body.hangoutRoom);
  if (!hangoutRoom) {
    return res.status(404).json({
      success: false,
      message: 'Hangout room not found'
    });
  }
  
  // Check if user is in the hangout room
  const isParticipant = hangoutRoom.currentParticipants.some(
    p => p.user.toString() === req.user.id
  );
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      message: 'You must be in the hangout room to create polls'
    });
  }
  
  const poll = await Poll.create(req.body);
  
  const populatedPoll = await Poll.findById(poll._id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name');
  
  res.status(201).json({
    success: true,
    data: populatedPoll
  });
});

// @desc    Vote on poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.voteOnPoll = asyncHandler(async (req, res, next) => {
  const { optionIndex } = req.body;
  
  const poll = await Poll.findById(req.params.id);
  
  if (!poll) {
    return res.status(404).json({
      success: false,
      message: 'Poll not found'
    });
  }
  
  if (!poll.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Poll is not active'
    });
  }
  
  if (poll.expiresAt && new Date() > poll.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'Poll has expired'
    });
  }
  
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid option index'
    });
  }
  
  // Check if user has already voted
  const hasVoted = poll.options.some(option => 
    option.voters.includes(req.user.id)
  );
  
  if (hasVoted && !poll.allowMultipleVotes) {
    return res.status(400).json({
      success: false,
      message: 'You have already voted on this poll'
    });
  }
  
  // Add vote
  poll.options[optionIndex].votes += 1;
  poll.options[optionIndex].voters.push(req.user.id);
  poll.totalVotes += 1;
  
  await poll.save();
  
  const updatedPoll = await Poll.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.voters', 'name profilePicture');
  
  res.status(200).json({
    success: true,
    data: updatedPoll
  });
});

// @desc    Update poll
// @route   PUT /api/polls/:id
// @access  Private
exports.updatePoll = asyncHandler(async (req, res, next) => {
  let poll = await Poll.findById(req.params.id);
  
  if (!poll) {
    return res.status(404).json({
      success: false,
      message: 'Poll not found'
    });
  }
  
  // Make sure user is poll creator
  if (poll.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this poll'
    });
  }
  
  poll = await Poll.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: poll
  });
});

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private
exports.deletePoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  
  if (!poll) {
    return res.status(404).json({
      success: false,
      message: 'Poll not found'
    });
  }
  
  // Make sure user is poll creator
  if (poll.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this poll'
    });
  }
  
  await poll.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Poll deleted successfully'
  });
});
