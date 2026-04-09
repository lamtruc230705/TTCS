const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminDashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), controller.getSummary);

module.exports = router;