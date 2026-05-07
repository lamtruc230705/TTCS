const express = require('express');

const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');
const artistPublicRoutes = require('./artist-public.routes');
const productPublicRoutes = require('./product-public.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const artistRoutes = require('./artist/artist.routes');
const adminRoutes = require('./admin/admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/artists', artistPublicRoutes);
router.use('/products', productPublicRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/artist', artistRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
