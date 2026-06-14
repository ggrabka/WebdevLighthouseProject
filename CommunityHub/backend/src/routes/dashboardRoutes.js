const express = require("express");
const requireLogin = require("../middleware/requireLogin");
const db = require("../database/database");

const router = express.Router();

router.get("/", requireLogin, function (req, res) {
  const openTasksResult = db.prepare(`
    SELECT COUNT(*) AS count
    FROM tasks
    WHERE status != 'Done'
  `).get();

  const completedTasksResult = db.prepare(`
    SELECT COUNT(*) AS count
    FROM tasks
    WHERE status = 'Done'
  `).get();

  const openDecisionsResult = db.prepare(`
    SELECT COUNT(*) AS count
    FROM decisions
    WHERE status = 'Proposal'
       OR status = 'In Discussion'
  `).get();

  const approvedDecisionsResult = db.prepare(`
    SELECT COUNT(*) AS count
    FROM decisions
    WHERE status = 'Approved'
  `).get();

  res.json({
    success: true,
    message: "Dashboard data loaded successfully",
    welcomeMessage: "Welcome, " + req.session.user.username,
    openTasks: openTasksResult.count,
    completedTasks: completedTasksResult.count,
    openDecisions: openDecisionsResult.count,
    approvedDecisions: approvedDecisionsResult.count,
    userRole: req.session.user.role
  });
});

module.exports = router;