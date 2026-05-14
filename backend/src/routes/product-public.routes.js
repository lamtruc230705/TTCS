const express = require('express');
const productPublicController = require('../controllers/product-public.controller');

const router = express.Router();

router.get('/', productPublicController.getProducts);
router.get('/:id', productPublicController.getProductDetail);

module.exports = router;
