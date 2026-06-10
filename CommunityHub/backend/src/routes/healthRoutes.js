// In this file, we define the health check route for the CommunityHub backend.
// We import the Express framework and create a new router instance.
const express = require("express");

// We create a new router instance using express.Router() which allows us to define routes for this specific module.
// The router will handle requests to the /api/health endpoint, providing a way to check if the backend is running and healthy.
const router = express.Router();

// We define a GET route at the root path of this router (which will be /api/health when mounted in app.js).
// When a GET request is made to this route, we respond with a JSON object containing a status and message indicating that the backend is running.
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CommunityHub backend is running"
  });
});

// Finally, we export the router so that it can be imported and used in other files, such as app.js 
// where we set up the routes for the Express application.
module.exports = router;