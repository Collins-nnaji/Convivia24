const express = require('express');
const {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity
} = require('../controllers/communities');

const { getCommunityEvents, createEvent } = require('../controllers/events');
const { getCommunityMessages, sendMessage } = require('../controllers/messages');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCommunities);
router.get('/:id', getCommunity);

// Protected routes
router.post('/', protect, createCommunity);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);
router.put('/:id/join', protect, joinCommunity);
router.put('/:id/leave', protect, leaveCommunity);

// Event routes
router.get('/:communityId/events', getCommunityEvents);
router.post('/:communityId/events', protect, createEvent);

// Message routes
router.get('/:communityId/messages', protect, getCommunityMessages);
router.post('/:communityId/messages', protect, sendMessage);

module.exports = router; 