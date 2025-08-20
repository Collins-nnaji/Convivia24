const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/orders');

const router = express.Router();

// Protected routes (User authentication required)
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', getAllOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
