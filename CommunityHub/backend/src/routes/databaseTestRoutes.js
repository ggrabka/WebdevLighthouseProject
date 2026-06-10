const express = require("express");
const db = require("../database/database");

// We create a new router instance using express.Router() which allows us to define routes for this specific module.
// The router will handle requests to the /api/database-test endpoint, providing a way to test if we can successfully query the SQLite database and return results.
const router = express.Router();

// We define a GET route at the root path of this router (which will be /api/database-test when mounted in app.js).
// When a GET request is made to this route, we execute a SQL query to select all rows from the database_test table and return the results in a JSON response.
router.get("/", (req, res) => {
  const result = db.prepare("SELECT * FROM database_test").all();

  res.status(200).json({
    success: true,
    message: "SQLite test query executed successfully",
    data: result
  });
});

// Finally, we export the router so that it can be imported and used in other files, such as app.js
module.exports = router;