const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const userRoutes = require('./admin-user.routes');
const productRoutes = require('./admin-product.routes');
const artistRoutes = require('./admin-artist.routes');
const scheduleRoutes = require('./admin-schedule.routes');
const orderRoutes = require('./admin-order.routes');
const revenueRoutes = require('./admin-revenue.routes');
const notificationRoutes = require('./admin-notification.routes');

const router = express.Router();

router.use(auth, authorize('admin'));
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/artists', artistRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/orders', orderRoutes);
router.use('/revenue', revenueRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
