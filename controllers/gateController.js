//=========================================================================================================
const asyncHandler = require("express-async-handler");
const { GateEntry, User } = require("../models"); // Ensure User model is included

// Get latest gate value and admin status for the logged-in user
const getGateForUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if user is admin
  if (user.role === "admin") {
    return res.json({ isAdmin: true, gate: null }); // Admin has no specific gate
  }

  // Otherwise, get gate assigned to the user from latest GateEntry
  const latestGateEntry = await GateEntry.findOne({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  if (!latestGateEntry) {
    res.status(404);
    throw new Error("No gate entry found for user");
  }

  res.json({ isAdmin: false, gate: latestGateEntry.gate });
});

module.exports = { getGateForUser };
