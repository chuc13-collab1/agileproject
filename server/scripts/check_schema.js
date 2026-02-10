import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // Fallback to default
}

const checkSchema = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'agile_project_management'
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        const [rows] = await connection.query('DESCRIBE topics');
        console.log('Schema of topics table:');
        console.table(rows);

        const hasReviewer = rows.some(r => r.Field === 'reviewer_id');
        console.log(`Has reviewer_id column: ${hasReviewer}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

checkSchema();
