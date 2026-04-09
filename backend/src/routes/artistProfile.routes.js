//routes quản lí hồ sơ nghệ sĩ

const express = require("express");
const router = express.Router();

const controller = require("../controllers/artistProfile.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/profile", authMiddleware, roleMiddleware("artist"), controller.getProfile);
router.put("/profile", authMiddleware, roleMiddleware("artist"), controller.updateProfile);
router.get("/products", authMiddleware, roleMiddleware("artist"), controller.getMyProducts);

module.exports = router;