const Prediction = require('../models/Prediction');
const HangoutRoom = require('../models/HangoutRoom');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get predictions for a hangout room
// @route   GET /api/predictions
// @access  Public
exports.getPredictions = asyncHandler(async (req, res, next) => {
  const { hangoutRoomId, category, isActive } = req.query;
  
  let query = {};
  
  if (hangoutRoomId) query.hangoutRoom = hangoutRoomId;
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  const predictions = await Prediction.find(query)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.bets.user', 'name profilePicture')
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Public
exports.getPrediction = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.bets.user', 'name profilePicture')
    .populate('winner', 'name profilePicture');
    
  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: prediction
  });
});

// @desc    Create new prediction
// @route   POST /api/predictions
// @access  Private
exports.createPrediction = asyncHandler(async (req, res, next) => {
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
      message: 'You must be in the hangout room to create predictions'
    });
  }
  
  const prediction = await Prediction.create(req.body);
  
  const populatedPrediction = await Prediction.findById(prediction._id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name');
  
  res.status(201).json({
    success: true,
    data: populatedPrediction
  });
});

// @desc    Place bet on prediction
// @route   POST /api/predictions/:id/bet
// @access  Private
exports.placeBet = asyncHandler(async (req, res, next) => {
  const { optionIndex, amount } = req.body;
  
  const prediction = await Prediction.findById(req.params.id);
  
  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }
  
  if (!prediction.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Prediction is not active'
    });
  }
  
  if (new Date() > prediction.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'Prediction has expired'
    });
  }
  
  if (optionIndex < 0 || optionIndex >= prediction.options.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid option index'
    });
  }
  
  if (amount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Bet amount must be at least 1'
    });
  }
  
  // Check if user has enough loyalty points
  const user = await User.findById(req.user.id);
  if (user.stats.loyaltyPoints < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient loyalty points'
    });
  }
  
  // Add bet
  prediction.options[optionIndex].bets.push({
    user: req.user.id,
    amount: amount,
    placedAt: new Date()
  });
  prediction.options[optionIndex].totalBets += amount;
  prediction.totalBets += amount;
  
  // Deduct loyalty points from user
  user.stats.loyaltyPoints -= amount;
  user.stats.predictionsMade += 1;
  await user.save();
  
  await prediction.save();
  
  const updatedPrediction = await Prediction.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.bets.user', 'name profilePicture');
  
  res.status(200).json({
    success: true,
    data: updatedPrediction
  });
});

// @desc    Resolve prediction
// @route   POST /api/predictions/:id/resolve
// @access  Private
exports.resolvePrediction = asyncHandler(async (req, res, next) => {
  const { winningOption } = req.body;
  
  const prediction = await Prediction.findById(req.params.id);
  
  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }
  
  // Make sure user is prediction creator
  if (prediction.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to resolve this prediction'
    });
  }
  
  if (winningOption < 0 || winningOption >= prediction.options.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid winning option'
    });
  }
  
  // Resolve prediction
  prediction.result.winningOption = winningOption;
  prediction.result.isResolved = true;
  prediction.result.resolvedAt = new Date();
  prediction.isActive = false;
  
  // Calculate and distribute winnings
  const winningOptionData = prediction.options[winningOption];
  const totalWinningBets = winningOptionData.totalBets;
  const totalBets = prediction.totalBets;
  
  if (totalWinningBets > 0) {
    const winningUsers = [];
    
    for (const bet of winningOptionData.bets) {
      const user = await User.findById(bet.user);
      if (user) {
        // Calculate winnings based on odds
        const winnings = Math.floor(bet.amount * winningOptionData.odds);
        user.stats.loyaltyPoints += winnings;
        user.stats.correctPredictions += 1;
        await user.save();
        
        winningUsers.push({
          user: bet.user,
          betAmount: bet.amount,
          winnings: winnings
        });
      }
    }
    
    prediction.result.winningUsers = winningUsers;
  }
  
  await prediction.save();
  
  const updatedPrediction = await Prediction.findById(req.params.id)
    .populate('creator', 'name profilePicture')
    .populate('hangoutRoom', 'name')
    .populate('options.bets.user', 'name profilePicture');
  
  res.status(200).json({
    success: true,
    data: updatedPrediction
  });
});

// @desc    Update prediction
// @route   PUT /api/predictions/:id
// @access  Private
exports.updatePrediction = asyncHandler(async (req, res, next) => {
  let prediction = await Prediction.findById(req.params.id);
  
  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }
  
  // Make sure user is prediction creator
  if (prediction.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this prediction'
    });
  }
  
  // Don't allow updates if prediction is resolved
  if (prediction.result.isResolved) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update resolved prediction'
    });
  }
  
  prediction = await Prediction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: prediction
  });
});

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private
exports.deletePrediction = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id);
  
  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }
  
  // Make sure user is prediction creator
  if (prediction.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this prediction'
    });
  }
  
  // Refund all bets if prediction is deleted
  if (prediction.totalBets > 0) {
    for (const option of prediction.options) {
      for (const bet of option.bets) {
        const user = await User.findById(bet.user);
        if (user) {
          user.stats.loyaltyPoints += bet.amount;
          await user.save();
        }
      }
    }
  }
  
  await prediction.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Prediction deleted successfully'
  });
});
