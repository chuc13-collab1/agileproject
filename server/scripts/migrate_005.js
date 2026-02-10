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

const migrate = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'agile_project_management',
        multipleStatements: true
    };

    console.log('Running Migration 005 on:', config.database);

    let connection;
    try {
        connection = await mysql.createConnection(config);

        const sqlPath = path.join(__dirname, '../migrations/005_add_reviewer_to_topics.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);

        console.log('✅ Migration 005 completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

migrate();
