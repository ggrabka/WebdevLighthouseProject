const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const db = require("../database/database");
const router = express.Router();

router.get("/", requireLogin, function (req, res) {
  const decisions = db.prepare(`
    SELECT
      id,
      title,
      description,
      proposal,
      status,
      result,
      created_at AS createdAt
    FROM decisions
    ORDER BY id DESC
  `).all();

  res.json({
    success: true,
    decisions: decisions
  });
});

module.exports = router;