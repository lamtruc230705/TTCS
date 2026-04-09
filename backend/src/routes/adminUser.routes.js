const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminUser.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), controller.getUsers);
router.get("/:id", authMiddleware, roleMiddleware("admin"), controller.getUserDetail);

module.exports = router;