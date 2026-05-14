const express = require('express');
const controller = require('../../controllers/artist/artist-profile.controller');

const router = express.Router();

router.get('/', controller.getProfile);
router.put('/request-update', controller.requestUpdate);

module.exports = router;
