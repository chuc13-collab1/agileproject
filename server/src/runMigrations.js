// Migration runner script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    // migrations folder is at server/migrations
    const migrationsDir = path.join(__dirname, '..', 'migrations');

    // Get all SQL files
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Run in order: 001, 002, 003, etc.

    console.log('📦 Running migrations...\n');

    for (const file of files) {
        try {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Split by semicolons and filter empty statements
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            console.log(`Running ${file}...`);

            for (const statement of statements) {
                if (statement.trim()) {
                    await db.query(statement);
                }
            }

            console.log(`✅ ${file} completed\n`);
        } catch (error) {
            // Ignore "table already exists" errors
            if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log(`⚠️  ${file} - Table already exists (skipped)\n`);
            } else {
                console.error(`❌ Error in ${file}:`, error.message);
                throw error;
            }
        }
    }

    console.log('✨ All migrations completed!');
    process.exit(0);
}

runMigrations().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
