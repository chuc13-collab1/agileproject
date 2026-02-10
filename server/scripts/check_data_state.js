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

const checkData = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'agile_project_management'
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);

        // Check Topics
        const [allTopics] = await connection.query('SELECT count(*) as count FROM topics');
        const [approvedTopics] = await connection.query('SELECT count(*) as count FROM topics WHERE status = "approved"');

        // Check Users
        const [allUsers] = await connection.query('SELECT role, count(*) as count FROM users GROUP BY role');

        console.log('--- Data State Check ---');
        console.log(`Total Topics: ${allTopics[0].count}`);
        console.log(`Approved Topics: ${approvedTopics[0].count}`);
        console.log('Users by Role:');
        console.table(allUsers);

        if (approvedTopics[0].count === 0) {
            console.log('⚠️  WARNING: No approved topics found. Reviewer assignment requires topics with status="approved".');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

checkData();
