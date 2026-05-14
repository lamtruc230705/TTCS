const express = require('express');
const controller = require('../../controllers/artist/artist-earning.controller');

const router = express.Router();

router.get('/', controller.getEarnings);

module.exports = router;
