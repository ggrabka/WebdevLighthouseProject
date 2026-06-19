const express = require("express");
const db = require("../database/database");

const router = express.Router();

router.get("/", (req, res) => {
  const result = db.prepare("SELECT * FROM database_test").all();

  res.status(200).json({
    success: true,
    message: "SQLite test query executed successfully",
    data: result
  });
});

module.exports = router;