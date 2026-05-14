const express = require('express');
const controller = require('../../controllers/admin/admin-revenue.controller');

const router = express.Router();

router.get('/', controller.getRevenue);

module.exports = router;
