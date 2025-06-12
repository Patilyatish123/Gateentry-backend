const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const sendTokenResponse = (user, res) => {
  const token = generateToken(user.id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role = "employee", gate } = req.body; // added gate

  if (!username || !email || !password || !gate) {
    return res
      .status(400)
      .json({ message: "All fields are required including gate" });
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
    gate, // include gate in database entry
  });

  sendTokenResponse(user, res);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      gate: user.gate, // send back gate to frontend
    },
  });
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password, gate } = req.body;

  if (!email || !password || !gate) {
    return res
      .status(400)
      .json({ message: "Email, password, and gate are required" });
  }

  const user = await User.findOne({ where: { email, gate } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email, gate, or password");
  }

  // Set token cookie
  sendTokenResponse(user, res);

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      gate: user.gate,
    },
  });
});

exports.logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "username", "email", "role"],
  });
  res.status(200).json(user);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetToken = resetTokenHash;
  user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `Reset your password here: ${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });
    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    where: {
      resetToken: tokenHash,
      resetTokenExpire: { [require("sequelize").Op.gt]: Date.now() },
    },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  const newPassword = await bcrypt.hash(req.body.password, 12);
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpire = null;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});
