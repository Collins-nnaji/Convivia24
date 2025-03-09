const Community = require('../models/Community');
const User = require('../models/User');

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
exports.getCommunities = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Community.find(JSON.parse(queryStr)).populate('creator', 'name profilePicture');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Community.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const communities = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: communities.length,
      pagination,
      data: communities
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('members', 'name profilePicture');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new community
// @route   POST /api/communities
// @access  Private
exports.createCommunity = async (req, res) => {
  try {
    // Add user to req.body
    req.body.creator = req.user.id;
    
    // Add creator to members array
    req.body.members = [req.user.id];

    const community = await Community.create(req.body);

    // Add community to user's joinedCommunities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { joinedCommunities: community._id }
    });

    res.status(201).json({
      success: true,
      data: community
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private
exports.updateCommunity = async (req, res) => {
  try {
    let community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.id}`
      });
    }

    // Make sure user is community creator or admin
    if (community.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this community'
      });
    }

    community = await Community.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete community
// @route   DELETE /api/communities/:id
// @access  Private
exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.id}`
      });
    }

    // Make sure user is community creator or admin
    if (community.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this community'
      });
    }

    // Remove community from all users' joinedCommunities
    await User.updateMany(
      { joinedCommunities: community._id },
      { $pull: { joinedCommunities: community._id } }
    );

    await community.remove();

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

// @desc    Join community
// @route   PUT /api/communities/:id/join
// @access  Private
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.id}`
      });
    }

    // Check if user is already a member
    if (community.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this community'
      });
    }

    // Add user to community members
    community.members.push(req.user.id);
    community.memberCount = community.members.length;
    await community.save();

    // Add community to user's joinedCommunities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Leave community
// @route   PUT /api/communities/:id/leave
// @access  Private
exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `No community found with id ${req.params.id}`
      });
    }

    // Check if user is a member
    if (!community.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this community'
      });
    }

    // Check if user is the creator
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave the community'
      });
    }

    // Remove user from community members
    community.members = community.members.filter(
      member => member.toString() !== req.user.id
    );
    community.memberCount = community.members.length;
    await community.save();

    // Remove community from user's joinedCommunities
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}; 