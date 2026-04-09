const express = require("express");
const router = express.Router();

const artistPublicController = require("../controllers/artistPublic.controller");

router.get("/", artistPublicController.getAllArtists);
router.get("/:id", artistPublicController.getArtistDetail);
router.get("/:id/products", artistPublicController.getArtistProducts);

module.exports = router;