const app = require("./app");
const pool = require("./configs/db");
require('dotenv').config();

async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDBConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed. Please check your database configuration.');
    }

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      console.log(`Test API: http://localhost:${port}/test`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error.message);
    process.exit(1);
  }
}

startServer();