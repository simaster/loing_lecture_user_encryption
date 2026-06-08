const mysql = require("mysql2");
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
  console.error(
    "Missing DB config: set DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE in environment or .env"
  );
  throw new Error("Database credentials not configured.");
}

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    throw err;
  }
  console.log("Connected to MySQL");
});

module.exports = db;
