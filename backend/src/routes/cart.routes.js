const express = require('express');
const router = express.Router();
const { addToCart, getCart } = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/my-cart', authMiddleware, getCart);
router.post('/items', authMiddleware, addToCart);

module.exports = router;