const express = require('express');
const artistPublicController = require('../controllers/artist-public.controller');

const router = express.Router();

router.get('/', artistPublicController.getArtists);
router.get('/:id', artistPublicController.getArtistDetail);

module.exports = router;
