import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const checkandCreate = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'agile_project_management'
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);

        const [teachers] = await connection.query('SELECT * FROM users WHERE role = "teacher"');
        console.log(`Found ${teachers.length} teachers.`);
        console.table(teachers.map(t => ({ id: t.id, name: t.display_name, email: t.email })));

        if (teachers.length === 0) {
            console.log('Creating dummy teacher for testing...');
            // Create a dummy teacher
            const dummyId = uuidv4();
            await connection.query(
                'INSERT INTO users (id, uid, email, display_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [dummyId, 'dummy-teacher-uid', 'teacher@test.com', 'Giảng Viên Test', 'teacher', true]
            );
            console.log('✅ Created dummy teacher: Giảng Viên Test');
        }

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
};

checkandCreate();
