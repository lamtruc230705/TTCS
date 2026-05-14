const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const profileRoutes = require('./artist-profile.routes');
const scheduleRoutes = require('./artist-schedule.routes');
const productRoutes = require('./artist-product.routes');
const orderRoutes = require('./artist-order.routes');
const earningRoutes = require('./artist-earning.routes');

const router = express.Router();

router.use(auth, authorize('artist'));
router.use('/profile', profileRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/earnings', earningRoutes);

module.exports = router;
