// backend/routes/itemDetailRoutes.js

const express = require("express");
const router = express.Router();
const { createItemDetails } = require("../controllers/itemDetailController"); // <-- no .js extension

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createItemDetails);

module.exports = router;
