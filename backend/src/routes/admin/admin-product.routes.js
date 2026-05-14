const express = require('express');
const controller = require('../../controllers/admin/admin-product.controller');
const validate = require('../../middlewares/validate.middleware');
const { productSchema, productUpdateSchema } = require('../../validations/product.validation');

const router = express.Router();

router.get('/', controller.getProducts);
router.post('/', validate(productSchema), controller.createProduct);
router.put('/:id', validate(productUpdateSchema), controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
