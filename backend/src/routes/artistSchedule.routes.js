const express = require("express");
const router = express.Router();

const controller = require("../controllers/artistSchedule.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("artist"), controller.getSchedules);
router.post("/", authMiddleware, roleMiddleware("artist"), controller.createSchedule);

module.exports = router;