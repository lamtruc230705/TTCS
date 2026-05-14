const express = require('express');
const controller = require('../../controllers/admin/admin-notification.controller');

const router = express.Router();

router.get('/', controller.getNotifications);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
