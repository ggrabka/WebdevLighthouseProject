// In this file, we set up the connection to the SQLite database using the better-sqlite3 library.
// We create a database file called communityhub.db in the backend folder.
// We also run a small setup query to verify that the database connection works and create a test table if it doesn't exist.
const path = require("path");
const Database = require("better-sqlite3");

// Create path to database file
// The file will be created in the backend folder
const databasePath = path.join(__dirname, "../../communityhub.db");

// Open database connection
// If the file does not exist, SQLite creates it automatically
const db = new Database(databasePath);

// Run a simple query to create a test table if it doesn't exist. This also serves as a check to ensure that the database connection is working properly.
// The table is called database_test and has three columns: id (an auto-incrementing primary key), message (a text field), and created_at (a timestamp that defaults to the current time).
db.exec(`
  CREATE TABLE IF NOT EXISTS database_test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// We check if there are any rows in the database_test table. If there are no rows, we insert a test message to confirm that the database connection is working and that we can perform write operations.
// We prepare a SQL statement to count the number of rows in the database_test table and execute it using the get() method, which returns a single row as an object. We check the count property of that row to see if it is zero.
const row = db.prepare("SELECT COUNT(*) AS count FROM database_test").get();

if (row.count === 0) {
  db.prepare(`
    INSERT INTO database_test (message)
    VALUES (?)
  `).run("SQLite database connection works");
}
// Finally, we export the db instance so that it can be imported and used in other files, such as route handlers where we will perform database operations.
module.exports = db;
