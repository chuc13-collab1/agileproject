import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agile_project_management',
    multipleStatements: true
});

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/012_allow_null_supervisor.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration 012...');
        await pool.query(sql);
        console.log('Migration executed successfully');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
