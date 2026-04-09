const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/me", authMiddleware, roleMiddleware("user", "artist", "admin"), controller.getMyProfile);
router.put("/me", authMiddleware, roleMiddleware("user", "artist", "admin"), controller.updateMyProfile);

module.exports = router;