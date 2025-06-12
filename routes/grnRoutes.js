//==============================================================================/

const express = require("express");
const router = express.Router();

// Import the named exports
const { protect } = require("../middleware/authMiddleware");
const { getGRNData, saveGRN } = require("../controllers/grnController");
const { viewGRN } = require("../controllers/grnController"); // <-- THIS LINE
// Apply protect() to all routes in this router
router.use(protect);

router.get("/data", getGRNData);
router.post("/", saveGRN);

// Route to view GRN using gateEntryNumber
router.get("/view/:gateEntryNumber", viewGRN);

module.exports = router;
