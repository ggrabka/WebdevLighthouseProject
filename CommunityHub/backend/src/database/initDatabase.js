// This file is responsible for initializing the database with the necessary tables and default data.
// We use the better-sqlite3 library to connect to a SQLite database and execute SQL queries.
// We create a database file called communityhub.db in the backend folder, and we run a setup query to create a test table if it doesn't exist.
// We also check if there are any rows in the test table, and if not, we insert a test message to confirm that the database connection is working properly.

const db = require("./database");
const bcrypt = require("bcryptjs");

function initDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

    const existingUser = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get("admin");

    if (!existingUser) {
    const passwordHash = bcrypt.hashSync("admin123", 10);

    db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `).run("admin", passwordHash, "admin");

    console.log("Default admin user created.");
  }
}

module.exports = initDatabase;