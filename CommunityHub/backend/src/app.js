const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const cors = require("cors");

const initDatabase = require("./database/initDatabase");

const session = require("express-session");

const databaseTestRoutes = require("./routes/databaseTestRoutes");

const authRoutes = require("./routes/authRoutes");

const taskRoutes = require("./routes/taskRoutes");
const decisionRoutes = require("./routes/decisionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();

initDatabase();

app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: "communityhub-secret-key",
    //if session should be saved back to store even if never modified
    resave: false,
    //if empty session is saved
    saveUninitialized: false,
    cookie: {
      //prevents from client-side JS to read the cookie
      httpOnly: true,
      //cookie can be sent over unecrypted http
      secure: false,
      maxAge: 1000 * 60 * 60
    }
  })
);

app.use("/api/health", healthRoutes);
app.use("/api/database-test", databaseTestRoutes);
app.use("/api", authRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/decisions", decisionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong on the server"
  });
});

module.exports = app;