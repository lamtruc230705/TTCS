const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool;

async function connectDB() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("Connected to SQL Server");
    }
    return pool;
  } catch (error) {
    console.error("DB connection error:", error);
    throw error;
  }
}

module.exports = {
  sql,
  connectDB
};