const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.post("/checkout", authMiddleware, roleMiddleware("user"), orderController.checkout);
router.get("/my-orders", authMiddleware, roleMiddleware("user"), orderController.getMyOrders);

module.exports = router;