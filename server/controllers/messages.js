const Message = require('../models/Message');
const Community = require('../models/Community');

// @desc    Get messages for a community
// @route   GET /api/communities/:communityId/messages
// @access  Private
exports.getCommunityMessages = async (req, res) => {
  try {
    // Check if community exists
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.communityId}`
      });
    }

    // Check if user is a member of the community
    if (!community.members.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'You must be a member of the community to view messages'
      });
    }

    const messages = await Message.find({ community: req.params.communityId })
      .populate('sender', 'name profilePicture')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Send a message to a community
// @route   POST /api/communities/:communityId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    // Check if community exists
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.communityId}`
      });
    }

    // Check if user is a member of the community
    if (!community.members.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'You must be a member of the community to send messages'
      });
    }

    // Add user and community to req.body
    req.body.sender = req.user.id;
    req.body.community = req.params.communityId;

    const message = await Message.create(req.body);

    // Populate sender information
    await message.populate('sender', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: `No message found with id ${req.params.id}`
      });
    }

    // Make sure user is message sender or admin
    if (message.sender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}; 