const express = require('express');
const {
  getPredictions,
  getPrediction,
  createPrediction,
  placeBet,
  resolvePrediction,
  updatePrediction,
  deletePrediction
} = require('../controllers/predictions');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPredictions)
  .post(protect, createPrediction);

router.route('/:id')
  .get(getPrediction)
  .put(protect, updatePrediction)
  .delete(protect, deletePrediction);

router.route('/:id/bet')
  .post(protect, placeBet);

router.route('/:id/resolve')
  .post(protect, resolvePrediction);

module.exports = router;
