const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/checkout', authenticate, orderController.checkout);

module.exports = router;