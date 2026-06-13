const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.get("/tasks", requireLogin, (req, res) => {
const tasks = [
  {
    id: 1,
    title: "Prepare community meeting",
    responsiblePerson: "Anna",
    status: "open",
    dueDate: "2026-07-01"
  },
  {
    id: 2,
    title: "Check shared garden equipment",
    responsiblePerson: "Markus",
    status: "in progress",
    dueDate: "2026-07-05"
  },
  {
    id: 3,
    title: "Update notice board",
    responsiblePerson: "Gabriel",
    status: "done",
    dueDate: "2026-06-30"
  }
];

    res.json({
        success: true,
        message: "Tasks loaded successfully",
        tasks: tasks
    });
});

module.exports = router;