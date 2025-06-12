const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware for verifying JWT tokens
const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1]; // Check cookie or authorization header

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication failed. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token." });
    }

    // If the token is valid, attach the user to the request object
    req.user = user;

    // Optionally: Verify if the user exists in the database (extra layer of security)
    try {
      const foundUser = await User.findByPk(user.id);
      if (!foundUser) {
        return res.status(401).json({ error: "User not found." });
      }

      // Additional check if the user is active (Optional)
      if (!foundUser.isActive) {
        return res.status(403).json({ error: "User account is deactivated." });
      }

      next();
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  });
};

// Middleware for role-based access control (RBAC)
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // The role comes from the authenticated user's token

    if (!userRole) {
      return res.status(401).json({ error: "Role not found for the user." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
