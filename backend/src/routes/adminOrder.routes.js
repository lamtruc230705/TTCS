const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminOrder.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), controller.getOrders);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), controller.updateOrderStatus);

module.exports = router;