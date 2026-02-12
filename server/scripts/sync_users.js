import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agile_project_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function syncUsers() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database');

        // 1. Sync Students
        const [studentUsers] = await connection.query('SELECT * FROM users WHERE role = "student"');
        console.log(`Found ${studentUsers.length} student users`);

        for (const user of studentUsers) {
            const [existing] = await connection.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
            if (existing.length === 0) {
                const studentId = uuidv4();
                // Generate a random student code if needed, or use a placeholder
                const studentCode = 'S' + Math.floor(100000 + Math.random() * 900000);
                await connection.query(
                    'INSERT INTO students (id, user_id, student_id, class_name, major) VALUES (?, ?, ?, ?, ?)',
                    [studentId, user.id, studentCode, 'D20CQCN01-N', 'Software Engineering']
                );
                console.log(`Created student record for user ${user.display_name} (${user.email})`);
            }
        }

        // 2. Sync Teachers
        const [teacherUsers] = await connection.query('SELECT * FROM users WHERE role = "teacher"');
        console.log(`Found ${teacherUsers.length} teacher users`);

        for (const user of teacherUsers) {
            const [existing] = await connection.query('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
            if (existing.length === 0) {
                const teacherId = uuidv4();
                const teacherCode = 'T' + Math.floor(100000 + Math.random() * 900000);
                await connection.query(
                    'INSERT INTO teachers (id, user_id, teacher_id, department) VALUES (?, ?, ?, ?)',
                    [teacherId, user.id, teacherCode, 'Information Technology']
                );
                console.log(`Created teacher record for user ${user.display_name} (${user.email})`);
            }
        }

        console.log('Sync complete');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncUsers();
