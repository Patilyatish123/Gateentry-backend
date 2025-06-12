const express = require("express");
const router = express.Router();
const {
  createGateEntry,
  fetchGateEntries,
  getGateEntryById,
  updateGateEntry,
  deleteGateEntry,
  getAllEntriesAdmin,
  adminDeleteEntry,
  adminUpdateEntry,
} = require("../controllers/gateEntryController");
const { protect, admin } = require("../middleware/authMiddleware");

// Regular user routes
router.post("/", protect, createGateEntry);
router.get("/user", protect, fetchGateEntries);
router.get("/:id", protect, getGateEntryById);
router.put("/:id", protect, updateGateEntry);
router.delete("/:id", protect, deleteGateEntry);

// Admin-only routes
// router.get('/admin/all', protect, admin, getAllEntriesAdmin);
// router.delete('/admin/:id', protect, admin, adminDeleteEntry);
// router.put('/admin/:id', protect, admin, adminUpdateEntry);

module.exports = router;
