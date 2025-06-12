require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { generateCsrfToken } = require("./middleware/csrfMiddleware");
const gateEntryRoutes = require("./routes/gateEntryRoutes");
const itemDetails = require("./routes/itemDetailRoutes");
const grnRoutes = require("./routes/grnRoutes");
const gateRoutes = require("./routes/gateRoutes");
const emailRoutes = require("./routes/emailNotificationRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // important for sending cookies across domains
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ SESSION CONFIG — required for CSRF to store token server-side
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax", // or 'Strict' if needed
    },
  })
);

// ✅ ROUTE TO SET CSRF TOKEN
app.get("/api/csrf-token", generateCsrfToken);

// ✅ AUTH ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/entry", gateEntryRoutes);
app.use("/api/item-details", itemDetails);
app.use("/api/grn", grnRoutes);
app.use("/api/notify", emailRoutes);
app.use("/api", gateRoutes);

// Optional: basic error handler
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.message);
  res.status(res.statusCode || 500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
