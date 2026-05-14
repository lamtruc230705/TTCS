const express = require('express');
const controller = require('../../controllers/artist/artist-schedule.controller');

const router = express.Router();

router.get('/', controller.getSchedules);

module.exports = router;
