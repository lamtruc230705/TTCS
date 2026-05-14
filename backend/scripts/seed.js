require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbName = process.env.DB_NAME || 'gmtheevn_db';

function applyPlaceholders(sql) {
  const adminPasswordHash = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 10);
  const artistPasswordHash = bcrypt.hashSync(process.env.DEFAULT_ARTIST_PASSWORD || 'artist123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  return sql
    .replaceAll('__ADMIN_USERNAME__', process.env.DEFAULT_ADMIN_USERNAME || 'admin')
    .replaceAll('__ADMIN_EMAIL__', process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com')
    .replaceAll('__ADMIN_PHONE__', process.env.DEFAULT_ADMIN_PHONE || '0900000000')
    .replaceAll('__ADMIN_PASSWORD_HASH__', adminPasswordHash)
    .replaceAll('__ARTIST_PASSWORD_HASH__', artistPasswordHash)
    .replaceAll('__USER_PASSWORD_HASH__', userPasswordHash);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true
  });

  const seedDir = path.join(__dirname, '..', 'database', 'seeders');
  const files = fs.readdirSync(seedDir).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const rawSql = fs.readFileSync(path.join(seedDir, file), 'utf8');
    const sql = applyPlaceholders(rawSql);
    await connection.query(sql);
    console.log(`[OK] ${file}`);
  }

  await connection.end();
  console.log('Seeding completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
