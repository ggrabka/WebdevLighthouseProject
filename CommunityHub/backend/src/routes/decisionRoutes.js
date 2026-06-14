const express = require("express");
const router = express.Router();

const db = require("../database/database");
const requireLogin = require("../middleware/requireLogin");

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

router.post("/", requireLogin, function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const proposal = req.body.proposal;
  const status = req.body.status || "Proposal";
  const result = "";

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required"
    });
  }

  const createdAt = new Date().toISOString();

  const insertDecision = db.prepare(`
    INSERT INTO decisions (title, description, proposal, status, result, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const resultInfo = insertDecision.run(
    title,
    description,
    proposal,
    status,
    result,
    createdAt
  );

  res.status(201).json({
    success: true,
    message: "Decision was created",
    decision: {
      id: resultInfo.lastInsertRowid,
      title: title,
      description: description,
      proposal: proposal,
      status: status,
      result: result,
      createdAt: createdAt
    }
  });
});

module.exports = router;