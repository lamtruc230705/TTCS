const express = require("express");
const router = express.Router();

const controller = require("../controllers/artistRevenue.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/summary", authMiddleware, roleMiddleware("artist"), controller.getRevenueSummary);

module.exports = router;