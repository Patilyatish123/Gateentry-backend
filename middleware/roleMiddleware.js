// File: backend/middleware/roleMiddleware.js

const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Make sure User model is properly imported

// Middleware to check if the user has the required role(s)
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Get the token from the Authorization header
      const token = req.cookies.token; // Assuming you're using cookies to store the token
      if (!token) {
        return res
          .status(401)
          .json({ error: "No token provided, access denied" });
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      // Find the user in the database
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has the required role(s)
      if (!roles.includes(user.role)) {
        return res
          .status(403)
          .json({ error: "Access denied, insufficient role" });
      }

      // If the user has the required role, proceed to the next middleware
      next();
    } catch (err) {
      console.error("Error in roleMiddleware:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
};

module.exports = checkRole;
