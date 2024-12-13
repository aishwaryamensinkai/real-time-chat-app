const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Helper function for password validation
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Helper function to generate tokens
const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { token, refreshToken };
};

// User Signup
router.post("/signup", async (req, res, next) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return next({ status: 400, message: "Please enter all fields" });
  }

  if (!validatePassword(password)) {
    return next({
      status: 400,
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return next({ status: 400, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "Member",
    });
    await user.save();

    const { token, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// User Login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next({ status: 400, message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return next({ status: 400, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next({ status: 400, message: "Invalid credentials" });

    const { token, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Refresh token is invalid" });
    }

    const { token, newRefreshToken } = generateTokens(user);
    user.refreshTokens.push(newRefreshToken);
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken); // Replace the old refresh token
    await user.save();

    res.json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Refresh token is required for logout" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
});

module.exports = router;
