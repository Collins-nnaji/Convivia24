const express = require('express');
const {
  getHangoutRooms,
  getHangoutRoom,
  createHangoutRoom,
  joinHangoutRoom,
  leaveHangoutRoom,
  updateHangoutRoom,
  deleteHangoutRoom
} = require('../controllers/hangoutRooms');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getHangoutRooms)
  .post(protect, createHangoutRoom);

router.route('/:id')
  .get(getHangoutRoom)
  .put(protect, updateHangoutRoom)
  .delete(protect, deleteHangoutRoom);

router.route('/:id/join')
  .post(protect, joinHangoutRoom);

router.route('/:id/leave')
  .post(protect, leaveHangoutRoom);

module.exports = router;
