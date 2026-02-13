// Migration runner script
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'agile_project_management',
        multipleStatements: true
    });

    try {
        console.log('✅ Connected to database');

        // Migration files to run
        const migrations = [
            '006_create_projects_table.sql',
            '007_create_progress_reports_table.sql',
            '008_create_comments_table.sql',
            '015_create_scheduling_tables.sql'
        ];

        for (const migrationFile of migrations) {
            const filePath = path.join(__dirname, 'migrations', migrationFile);

            if (fs.existsSync(filePath)) {
                try {
                    const sql = fs.readFileSync(filePath, 'utf8');
                    await connection.query(sql);
                    console.log(`✅ Executed: ${migrationFile}`);
                } catch (err) {
                    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log(`ℹ️  Table already exists: ${migrationFile}`);
                    } else {
                        console.error(`❌ Error in ${migrationFile}:`, err.message);
                    }
                }
            } else {
                console.log(`⚠️  File not found: ${migrationFile}`);
            }
        }

        console.log('\n✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigrations().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
