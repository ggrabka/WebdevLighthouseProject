// This file is responsible for initializing the database with the necessary tables and default data.
// We use the better-sqlite3 library to connect to a SQLite database and execute SQL queries.
// We create a database file called communityhub.db in the backend folder, and we run a setup query to create a test table if it doesn't exist.
// We also check if there are any rows in the test table, and if not, we insert a test message to confirm that the database connection is working properly.

const db = require("./database");
const bcrypt = require("bcryptjs");

function addColumnIfMissing(tableName, columnName, columnSql) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();

  const columnExists = columns.some((column) => {
    return column.name === columnName;
  });

  if (!columnExists) {
    db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`).run();
  }
}

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


    const existingMember = db
  .prepare("SELECT * FROM users WHERE username = ?")
  .get("member");

if (!existingMember) {
  const passwordHash = bcrypt.hashSync("member123", 10);

  db.prepare(`
    INSERT INTO users (username, password_hash, role)
    VALUES (?, ?, ?)
  `).run("member", passwordHash, "member");

  console.log("Default member user created.");
}

    db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      responsible_person TEXT,
      status TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL
    )
  `).run();

  db.prepare(`
  CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposal TEXT,
    status TEXT NOT NULL,
    result TEXT,
    created_at TEXT NOT NULL
  )
`).run();

 const decisionCount = db.prepare("SELECT COUNT(*) AS count FROM decisions").get();

if (decisionCount.count === 0) {
  const insertDecision = db.prepare(`
    INSERT INTO decisions (title, description, proposal, status, result, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertDecision.run(
    "Renovate the community room",
    "The community room needs new paint and better lighting.",
    "We should collect offers from local painters and discuss the budget.",
    "In Discussion",
    "",
    new Date().toISOString()
  );

  insertDecision.run(
    "Create shared garden rules",
    "The garden should have clear rules for watering and shared usage.",
    "Each member should be responsible for watering on one day per week.",
    "Proposal",
    "",
    new Date().toISOString()
  );

  insertDecision.run(
    "Buy new cleaning equipment",
    "The old cleaning equipment is broken and should be replaced.",
    "Buy one new vacuum cleaner and basic cleaning tools.",
    "Approved",
    "Approved by the organizers.",
    new Date().toISOString()
  );
}

  addColumnIfMissing("tasks", "description", "description TEXT");
  addColumnIfMissing("tasks", "responsible_person", "responsible_person TEXT");
  addColumnIfMissing("tasks", "status", "status TEXT NOT NULL DEFAULT 'New'");
  addColumnIfMissing("tasks", "due_date", "due_date TEXT");
  addColumnIfMissing("tasks", "created_at", "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");

  console.log("Database initialized");
}

module.exports = initDatabase;