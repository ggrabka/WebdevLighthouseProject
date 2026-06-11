const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/database");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to access this endpoint"
    });
  }

  next();
}

const router = express.Router();

router.get("/protected", requireLogin, (req, res) => {
  res.json({
    success: true,
    message: "You are logged in and can access this protected endpoint",
    user: req.session.user
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

  if (!passwordIsValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return res.json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "No active session found"
    });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logout successful"
    });
  });
});



module.exports = router;