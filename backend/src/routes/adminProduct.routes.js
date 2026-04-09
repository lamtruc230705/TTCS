const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminProduct.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), controller.getProducts);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), controller.updateProductStatus);

module.exports = router;