const express = require('express');
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { checkoutSchema } = require('../validations/order.validation');

const router = express.Router();

router.use(auth);
router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/my-orders', orderController.myOrders);
router.get('/:id', orderController.myOrderDetail);

module.exports = router;
