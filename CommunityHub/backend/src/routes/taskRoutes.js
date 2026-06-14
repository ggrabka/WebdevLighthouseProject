const express = require("express");
const router = express.Router();

const db = require("../database/database");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/", requireLogin, (req, res) => {
  const tasks = db.prepare(`
    SELECT
      id,
      title,
      description,
      responsible_person AS responsiblePerson,
      status,
      due_date AS dueDate,
      created_at AS createdAt
    FROM tasks
    ORDER BY id DESC
  `).all();

  res.json({
    success: true,
    tasks: tasks
  });
});

router.post("/", requireAdmin, (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const responsiblePerson = req.body.responsiblePerson;
  const status = req.body.status;
  const dueDate = req.body.dueDate;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  const finalStatus = status || "New";

  const result = db.prepare(`
    INSERT INTO tasks (
      title,
      description,
      responsible_person,
      status,
      due_date,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(
    title,
    description || "",
    responsiblePerson || "",
    finalStatus,
    dueDate || ""
  );

  const newTask = db.prepare(`
    SELECT
      id,
      title,
      description,
      responsible_person AS responsiblePerson,
      status,
      due_date AS dueDate,
      created_at AS createdAt
    FROM tasks
    WHERE id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: "Task was created",
    task: newTask
  });
});

router.put("/:id", requireAdmin, (req, res) => {
  const id = req.params.id;

  const title = req.body.title;
  const responsiblePerson = req.body.responsiblePerson;
  const status = req.body.status;
  const dueDate = req.body.dueDate;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  const existingTask = db.prepare(`
    SELECT * FROM tasks
    WHERE id = ?
  `).get(id);

  if (!existingTask) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  db.prepare(`
    UPDATE tasks
    SET
      title = ?,
      responsible_person = ?,
      status = ?,
      due_date = ?
    WHERE id = ?
  `).run(
    title,
    responsiblePerson || "",
    status || "New",
    dueDate || "",
    id
  );

  const updatedTask = db.prepare(`
    SELECT
      id,
      title,
      description,
      responsible_person AS responsiblePerson,
      status,
      due_date AS dueDate,
      created_at AS createdAt
    FROM tasks
    WHERE id = ?
  `).get(id);

  res.json({
    success: true,
    message: "Task was updated",
    task: updatedTask
  });
});

router.delete("/:id", requireAdmin, (req, res) => {
  const id = req.params.id;

  const existingTask = db.prepare(`
    SELECT * FROM tasks
    WHERE id = ?
  `).get(id);

  if (!existingTask) {
    return res.status(404).json({
      success: false,
      message: "Task not found"
    });
  }

  db.prepare(`
    DELETE FROM tasks
    WHERE id = ?
  `).run(id);

  res.json({
    success: true,
    message: "Task was deleted",
    deletedTaskId: id
  });
});

module.exports = router;