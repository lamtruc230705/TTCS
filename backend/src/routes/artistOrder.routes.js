// routes cho nghệ sĩ xem đơn hàng liên quan tới mình

const express = require("express");
const router = express.Router();

const controller = require("../controllers/artistOrder.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("artist"), controller.getMyOrders);
router.get("/:id", authMiddleware, roleMiddleware("artist"), controller.getOrderDetail);
router.patch("/:id/status", authMiddleware, roleMiddleware("artist"), controller.updateOrderStatus);

module.exports = router;