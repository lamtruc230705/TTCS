require('dotenv').config();

const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

const dbName = process.env.DB_NAME || 'gmtheevn_db';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await connection.end();

  console.log(`Dropped database ${dbName}.`);
  execSync('npm run migrate', { stdio: 'inherit' });
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('Database reset completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
