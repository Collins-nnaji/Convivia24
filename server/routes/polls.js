const express = require('express');
const {
  getPolls,
  getPoll,
  createPoll,
  voteOnPoll,
  updatePoll,
  deletePoll
} = require('../controllers/polls');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPolls)
  .post(protect, createPoll);

router.route('/:id')
  .get(getPoll)
  .put(protect, updatePoll)
  .delete(protect, deletePoll);

router.route('/:id/vote')
  .post(protect, voteOnPoll);

module.exports = router;
