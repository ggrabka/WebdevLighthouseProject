//path is a node.js utility tool and works great for using os agnostic path variables
const path = require("path");
const Database = require("better-sqlite3");

//__dirname is a built-in Node.js variable that gives you the absolute path to the directory where your current JavaScript file lives
const databasePath = path.join(__dirname, "../../communityhub.db");

// If the file does not exist, SQLite creates it automatically
const db = new Database(databasePath);

//.exec() is designed for Data Definition Language (DDL)—things like CREATE TABLE, DROP TABLE, or ALTER TABLE.
db.exec(`
  CREATE TABLE IF NOT EXISTS database_test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const row = db.prepare("SELECT COUNT(*) AS count FROM database_test").get();

if (row.count === 0) {
  db.prepare(`
    INSERT INTO database_test (message)
    VALUES (?)
  `).run("SQLite database connection works");
}

module.exports = db;
