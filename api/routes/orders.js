const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const OrderController = require('../controllers/orders');

router.get('/', checkAuth, OrderController.getAllOrder);

router.post('/', checkAuth, OrderController.createOrder);

router.get('/:orderId', checkAuth, OrderController.getAnOrder);

router.delete('/:orderId',checkAuth , OrderController.deleteAnOrder);

module.exports = router;