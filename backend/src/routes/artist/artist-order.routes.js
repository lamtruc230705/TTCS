const express = require('express');
const controller = require('../../controllers/artist/artist-order.controller');
const validate = require('../../middlewares/validate.middleware');
const { updateOrderStatusSchema } = require('../../validations/order.validation');

const router = express.Router();

router.get('/', controller.getOrders);
router.get('/:id', controller.getOrderDetail);
router.put('/:id/status', validate(updateOrderStatusSchema), controller.updateOrderStatus);
router.delete('/:id', controller.deleteOrder);

module.exports = router;
