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

async function runCreateProjects() {
    try {
        const sqlPath = path.join(__dirname, '../create-projects-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running create-projects-table.sql...');
        await pool.query(sql);
        console.log('Projects table created/verified successfully');

        process.exit(0);
    } catch (error) {
        console.error('Failed to create projects table:', error);
        process.exit(1);
    }
}

runCreateProjects();
