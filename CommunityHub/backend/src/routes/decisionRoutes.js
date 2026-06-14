const express = require("express");
const router = express.Router();

const db = require("../database/database");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");

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

router.post("/", requireAdmin, function (req, res) {
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

router.put("/:id", requireAdmin, function (req, res) {
  const decisionId = req.params.id;
  const status = req.body.status;
  const result = req.body.result || "";

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required"
    });
  }

  const updateDecision = db.prepare(`
    UPDATE decisions
    SET status = ?, result = ?
    WHERE id = ?
  `);

  const updateResult = updateDecision.run(status, result, decisionId);

  if (updateResult.changes === 0) {
    return res.status(404).json({
      success: false,
      message: "Decision not found"
    });
  }

  const updatedDecision = db.prepare(`
    SELECT
      id,
      title,
      description,
      proposal,
      status,
      result,
      created_at AS createdAt
    FROM decisions
    WHERE id = ?
  `).get(decisionId);

  res.json({
    success: true,
    message: "Decision was updated",
    decision: updatedDecision
  });
});

router.delete("/:id", requireAdmin, function (req, res) {
  const decisionId = req.params.id;

  const deleteDecision = db.prepare(`
    DELETE FROM decisions
    WHERE id = ?
  `);

  const deleteResult = deleteDecision.run(decisionId);

  if (deleteResult.changes === 0) {
    return res.status(404).json({
      success: false,
      message: "Decision not found"
    });
  }

  res.json({
    success: true,
    message: "Decision was deleted",
    deletedId: decisionId
  });
});

module.exports = router;