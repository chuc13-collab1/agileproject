
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkSchema = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'agile_project_management'
        });

        console.log('--- Students ID Column ---');
        const [students] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLLATION_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'agile_project_management'}' 
            AND TABLE_NAME = 'students' 
            AND COLUMN_NAME = 'id'
        `);
        console.log(JSON.stringify(students, null, 2));

        console.log('\n--- Teachers ID Column ---');
        const [teachers] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLLATION_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'agile_project_management'}' 
            AND TABLE_NAME = 'teachers' 
            AND COLUMN_NAME = 'id'
        `);
        console.log(JSON.stringify(teachers, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

checkSchema();
