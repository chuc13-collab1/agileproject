import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Use default dotenv behavior which looks in CWD
dotenv.config();

// Fallback to specific path if default fails
if (!process.env.DB_HOST) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

console.log('Migration Config:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME,
    hasPassword: !!process.env.DB_PASSWORD
});

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD, // Do not use hardcoded fallback locally if env exists
        database: process.env.DB_NAME || 'agile_project_management',
        multipleStatements: true
    });

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const sqlPath = path.join(__dirname, '../migrations/003_create_announcements_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration: 003_create_announcements_table.sql');
        await connection.query(sql);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration();
