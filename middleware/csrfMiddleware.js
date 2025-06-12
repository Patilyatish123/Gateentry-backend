const crypto = require("crypto");

// Generate a CSRF token and store it in session and cookie
function generateCsrfToken(req, res, next) {
  // Ensure the session exists before trying to assign a token
  if (!req.session.csrfToken) {
    const token = crypto.randomBytes(32).toString("hex");
    req.session.csrfToken = token; // Save token in session
  }

  // Set token in a cookie (accessible to frontend JavaScript)
  res.cookie("XSRF-TOKEN", req.session.csrfToken, {
    httpOnly: false, // Allow frontend JavaScript to access the token
    secure: process.env.NODE_ENV === "production", // Ensure cookie is secure in production
    sameSite: "Strict", // Protect against cross-site request forgery
  });

  // Send the CSRF token to the client
  res.json({ csrfToken: req.session.csrfToken });
}

// Validate the CSRF token from request header and session
function validateCsrfToken(req, res, next) {
  const csrfCookie = req.cookies["XSRF-TOKEN"];
  const csrfHeader = req.get("X-CSRF-Token");
  const sessionToken = req.session.csrfToken;

  // Debugging info (you can remove these in production)
  console.log("🧪 CSRF Cookie:", csrfCookie);
  console.log("🧪 CSRF Header:", csrfHeader);
  console.log("🧪 Session Token:", sessionToken);

  // If there is no token, or the tokens don't match, return an error
  if (
    !csrfCookie ||
    !csrfHeader ||
    !sessionToken ||
    csrfCookie !== csrfHeader ||
    csrfCookie !== sessionToken
  ) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  // If tokens are valid, continue to the next middleware
  next();
}

module.exports = {
  generateCsrfToken,
  validateCsrfToken,
};
