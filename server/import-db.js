// Import SQL schema lên Railway MySQL (MySQL 8 compatible)
// Chạy từ thư mục server: node import-db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Step 1: Drop all tables first (separate connection, no FK check)
const conn = await mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 37932,
    user: 'root',
    password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk',
    database: 'railway',
    multipleStatements: true,
});

console.log('✅ Connected to Railway MySQL');

// Drop all existing tables
console.log('🗑️  Dropping existing tables...');
await conn.query('SET FOREIGN_KEY_CHECKS=0');
const [tables] = await conn.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'railway'`
);
for (const row of tables) {
    await conn.query(`DROP TABLE IF EXISTS \`${row.TABLE_NAME}\``);
    console.log(`  Dropped: ${row.TABLE_NAME}`);
}
await conn.query('SET FOREIGN_KEY_CHECKS=1');

// Read SQL file
const sqlFile = path.join(__dirname, 'migrations', 'agile_project_management.sql');
let sql = fs.readFileSync(sqlFile, 'utf8');

// Normalize line endings + Fix MariaDB→MySQL8
sql = sql
    .replace(/\r\n/g, '\n')
    .replace(/\bint\(\d+\)/g, 'int')
    .replace(/\btinyint\(\d+\)/g, 'tinyint')
    .replace(/\bbigint\(\d+\)/g, 'bigint')
    .replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP');

// Prepend FK disable + Append FK enable
const wrappedSql = `SET FOREIGN_KEY_CHECKS=0;\n${sql}\nSET FOREIGN_KEY_CHECKS=1;`;

console.log('\n📦 Importing schema...');
try {
    await conn.query(wrappedSql);
    console.log('✅ Initial import done');
} catch (err) {
    console.warn(`⚠️  Warning during import: [${err.code}] ${err.sqlMessage?.substring(0, 100)}`);
    console.warn('   Continuing anyway...');
}

// Verify
const [finalTables] = await conn.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'railway'`
);
console.log(`\n📊 Tables created: ${finalTables.length}`);
if (finalTables.length > 0) {
    console.log(`   ${finalTables.map(r => r.TABLE_NAME).join(', ')}`);

    // Check some data
    try {
        const [users] = await conn.query('SELECT COUNT(*) as cnt FROM users');
        console.log(`   Users: ${users[0].cnt}`);
        const [topics] = await conn.query('SELECT COUNT(*) as cnt FROM topics');
        console.log(`   Topics: ${topics[0].cnt}`);
        const [projects] = await conn.query('SELECT COUNT(*) as cnt FROM projects');
        console.log(`   Projects: ${projects[0].cnt}`);
    } catch (e) { /* ignore */ }
}

await conn.end();
