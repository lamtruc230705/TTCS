const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Add event listener for connection pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// SQL type constants for compatibility
const sql = {
  Int: 'Int',
  NVarChar: 'NVarChar',
  DateTime: 'DateTime',
  Bit: 'Bit'
};

// MSSQL compatibility request adapter
class RequestAdapter {
  constructor(connection) {
    this.connection = connection;
    this.params = {};
    this.paramOrder = []; // Keep track of parameter order
  }

  input(name, type, value) {
    this.params[name] = value;
    this.paramOrder.push(name);
    return this;
  }

  async query(sqlQuery) {
    try {
      // Convert MSSQL syntax to MySQL
      let mysqlQuery = sqlQuery;
      const values = [];

      // Sort params by length (longest first) to avoid partial replacements
      const sortedParams = this.paramOrder.sort((a, b) => b.length - a.length);

      for (const paramName of sortedParams) {
        const value = this.params[paramName];
        const regex = new RegExp(`@${paramName}(?![a-zA-Z0-9_])`, 'g');
        mysqlQuery = mysqlQuery.replace(regex, '?');
        values.push(value);
      }

      // Convert MSSQL functions to MySQL
      mysqlQuery = mysqlQuery.replace(/GETDATE\(\)/g, 'NOW()');
      mysqlQuery = mysqlQuery.replace(/ISNULL\(/g, 'IFNULL(');
      mysqlQuery = mysqlQuery.replace(/@user_id/g, '?');
      mysqlQuery = mysqlQuery.replace(/@artist_id/g, '?');
      mysqlQuery = mysqlQuery.replace(/@product_id/g, '?');
      mysqlQuery = mysqlQuery.replace(/@(\w+)/g, '?');

      // Execute query
      const [rows] = await this.connection.query(mysqlQuery, values);
      return { recordset: rows };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
}

// Create a connection pool wrapper to mimic MSSQL API
async function connectDB() {
  const connection = await pool.getConnection();
  
  return {
    request: () => new RequestAdapter(connection),
    release: () => connection.release(),
    close: () => connection.end()
  };
}

module.exports = pool;
module.exports.connectDB = connectDB;
module.exports.sql = sql;