const express = require('express');
const cartController = require('../controllers/cart.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  addCartSchema,
  updateCartSchema,
  selectCartSchema,
  selectAllCartSchema
} = require('../validations/cart.validation');

const router = express.Router();

router.use(auth);
router.get('/', cartController.getCart);
router.post('/add', validate(addCartSchema), cartController.addToCart);
router.put('/items/:id', validate(updateCartSchema), cartController.updateCartItem);
router.delete('/items/:id', cartController.deleteCartItem);
router.patch('/items/:id/select', validate(selectCartSchema), cartController.selectCartItem);
router.patch('/select-all', validate(selectAllCartSchema), cartController.selectAll);

module.exports = router;
