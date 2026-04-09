const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminArtist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), controller.getArtists);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), controller.toggleArtistStatus);

module.exports = router;