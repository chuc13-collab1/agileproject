// Script import SQL schema lên Railway MySQL
// Chạy: node import-db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const connection = await mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 37932,
    user: 'root',
    password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk',
    database: 'railway',
    multipleStatements: true,
});

console.log('✅ Connected to Railway MySQL');

const sqlFile = path.resolve('./server/migrations/agile_project_management.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('📦 Importing schema...');
await connection.query(sql);

console.log('✅ Schema imported successfully!');
await connection.end();
