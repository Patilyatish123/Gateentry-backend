const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getGateForUser } = require("../controllers/gateController");

// router.get('/gate-info', protect, getGateInfo);
router.get("/gate-info", protect, getGateForUser);

module.exports = router;
