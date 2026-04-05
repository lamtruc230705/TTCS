const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artistPublic.controller");

router.get("/", artistController.getAllArtists);
router.get("/:id", artistController.getArtistDetail);
router.get("/:id/products", artistController.getArtistProducts);

module.exports = router;