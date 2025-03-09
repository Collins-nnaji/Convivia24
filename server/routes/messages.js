const express = require('express');
const {
  deleteMessage
} = require('../controllers/messages');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.delete('/:id', protect, deleteMessage);

module.exports = router; 