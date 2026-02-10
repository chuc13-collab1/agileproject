import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUsers() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD ? '******' : '(empty)',
        database: process.env.DB_NAME || 'agile_project_management'
    };
    console.log('DB Config:', dbConfig);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'agile_project_management'
    });

    try {
        const [rows] = await connection.query('SELECT email, role, uid, display_name FROM users');
        console.log(`Found ${rows.length} users.`);
        console.log('---------------------------------------------------');
        rows.forEach(r => {
            console.log(`Email: ${r.email} | Role: ${r.role} | Name: ${r.display_name}`);
        });
        console.log('---------------------------------------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkUsers();
