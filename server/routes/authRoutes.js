// routes/authRoutes.js
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

// User Signup
router.post("/signup", async (req, res, next) => {
  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return next({ status: 400, message: "Please enter all fields" });
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return next({
      status: 400,
      message:
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (user) return next({ status: 400, message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "Member",
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err); // Forward error to the error handling middleware
  }
});

// User Login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next({ status: 400, message: "Please enter all fields" });
  }

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) return next({ status: 400, message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next({ status: 400, message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
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

module.exports = router;
