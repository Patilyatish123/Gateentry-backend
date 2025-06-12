// routes/emailNotificationRoutes.js
const express = require("express");
const router  = express.Router();
// const auth    = require("../middleware/auth"); // optional
const ctrl    = require("../controllers/emailNotificationController");

router.post("/grn", ctrl.sendGrnNotification);

module.exports = router;
