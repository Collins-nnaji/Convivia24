const Event = require('../models/Event');
const Community = require('../models/Community');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
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
    query = Event.find(JSON.parse(queryStr))
      .populate('creator', 'name profilePicture')
      .populate('community', 'name image');

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
      query = query.sort('date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Event.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const events = await query;

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
      count: events.length,
      pagination,
      data: events
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get events for a community
// @route   GET /api/communities/:communityId/events
// @access  Public
exports.getCommunityEvents = async (req, res) => {
  try {
    const events = await Event.find({ community: req.params.communityId })
      .populate('creator', 'name profilePicture')
      .sort('date');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('community', 'name image')
      .populate('attendees', 'name profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/communities/:communityId/events
// @access  Private
exports.createEvent = async (req, res) => {
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
        message: 'You must be a member of the community to create an event'
      });
    }

    // Add user and community to req.body
    req.body.creator = req.user.id;
    req.body.community = req.params.communityId;

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with id ${req.params.id}`
      });
    }

    // Make sure user is event creator or admin
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with id ${req.params.id}`
      });
    }

    // Make sure user is event creator or admin
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.remove();

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

// @desc    Attend event
// @route   PUT /api/events/:id/attend
// @access  Private
exports.attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with id ${req.params.id}`
      });
    }

    // Check if user is already attending
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already attending this event'
      });
    }

    // Add user to event attendees
    event.attendees.push(req.user.id);
    event.attendeeCount = event.attendees.length;
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Cancel attendance
// @route   PUT /api/events/:id/cancel
// @access  Private
exports.cancelAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with id ${req.params.id}`
      });
    }

    // Check if user is attending
    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'User is not attending this event'
      });
    }

    // Remove user from event attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user.id
    );
    event.attendeeCount = event.attendees.length;
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}; 