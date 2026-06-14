// In this file, we set up the Express application, 
// define middleware for parsing JSON request bodies, 
// and set up basic routes and error handling. 

// We import the Express framework and the health routes from the specified file.
const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const cors = require("cors");

const initDatabase = require("./database/initDatabase");

// We also import the express-session middleware, which can be used to manage user sessions in our application.
const session = require("express-session");

// We also import the database test routes, which will allow us to test the connection to the SQLite database and return results from a test query.
const databaseTestRoutes = require("./routes/databaseTestRoutes");

// We also import the authentication routes, which will handle user registration, login, and logout functionality.
const authRoutes = require("./routes/authRoutes");

const taskRoutes = require("./routes/taskRoutes");
const decisionRoutes = require("./routes/decisionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

// We create an instance of the Express application.
const app = express();

initDatabase();

// We use the cors middleware to enable Cross-Origin Resource Sharing (CORS) for our backend API.
// This allows our frontend application, which may be served from a different origin (e.g., http://localhost:5173), to make requests to our backend API without being blocked by the browser's same-origin policy.
app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));


// We use the express.json() middleware to parse incoming JSON request bodies.
// This allows us to access the data sent in the request body as a JavaScript object.
// For example, if a client sends a POST request with a JSON body, 
// we can access the data in that body using req.body in our route handlers.
app.use(express.json());


// We set up the session middleware with a secret key and configuration options.
// This will allow us to manage user sessions in our application, 
// which is essential for features like user authentication and maintaining login state across requests.
app.use(
  session({
    secret: "communityhub-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60
    }
  })
);


// We set up the health check route at the path /api/health.
// When a GET request is made to this route, 
// the healthRoutes will handle it and respond with a JSON object indicating that the backend is running.
app.use("/api/health", healthRoutes);

// We set up the database test route at the path /api/database-test.
// When a GET request is made to this route, 
// the databaseTestRoutes will handle it, execute a SQL query to select all rows from the database_test table, and return the results in a JSON response.
app.use("/api/database-test", databaseTestRoutes);

// We set up the authentication routes at the path /api/auth.
// When requests are made to this path (e.g., for user registration, login, or logout), 
// the authRoutes will handle them and perform the necessary operations related to user authentication.
app.use("/api", authRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/decisions", decisionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// We define a catch-all route for handling 404 Not Found errors.
// If a request is made to a route that does not exist, 
// this middleware will be executed and respond with a 404 status code and a JSON error message.
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`
  });
});

// We define an error-handling middleware to catch any unexpected errors that occur in the application.
// If an error is thrown in any of the route handlers or middleware, 
// this function will be executed, logging the error and responding with a 
// 500 Internal Server Error status code and a JSON error message.
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong on the server"
  });
});

// Finally, we export the app instance so that it can be imported and used in other files, 
// such as server.js where we start the server.
module.exports = app;