import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agile_project_management',
});

async function debugUsers() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database');

        // 1. List all users
        const [users] = await connection.query('SELECT id, uid, email, display_name, role FROM users');
        console.log(`\nFound ${users.length} total users:`);

        for (const user of users) {
            const [student] = await connection.query('SELECT id, student_id FROM students WHERE user_id = ?', [user.id]);
            if (student.length > 0) {
                console.log(`[OK] User ${user.email} (uid: ${user.uid}) -> Student ID: ${student[0].id} (Code: ${student[0].student_id})`);
            } else {
                console.error(`[MISSING] User ${user.email} (uid: ${user.uid}) has NO linked student record!`);
            }
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

debugUsers();
