const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { validateCsrfToken } = require("../middleware/csrfMiddleware"); // ✅ Correct destructuring

// Routes for authentication
router.post("/register", registerUser);
router.post("/login", validateCsrfToken, loginUser); // ✅ Using the correct middleware function
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getCurrentUser);

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
