import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
    // Import modules after dotenv config
    const { auth } = await import('../src/config/firebase.js');
    const { default: pool } = await import('../src/config/database.js');

    const email = 'admin@agile.com';
    const password = 'password123';
    const displayName = 'Agile Admin';

    console.log(`Creating Admin: ${email}...`);

    let uid;
    try {
        // 1. Create/Get Firebase User
        try {
            const userRecord = await auth.getUserByEmail(email);
            console.log('Firebase user already exists:', userRecord.uid);
            uid = userRecord.uid;
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await auth.createUser({
                    email,
                    password,
                    displayName
                });
                console.log('Created new Firebase user:', userRecord.uid);
                uid = userRecord.uid;
            } else {
                throw error;
            }
        }

        // 2. Insert/Update MySQL User
        const connection = await pool.getConnection();
        try {
            // Check if exists
            const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

            if (rows.length > 0) {
                console.log('Updating existing MySQL user role to admin...');
                await connection.query('UPDATE users SET role = "admin", uid = ? WHERE email = ?', [uid, email]);
            } else {
                console.log('Inserting new Admin into MySQL...');
                await connection.query(
                    `INSERT INTO users (id, uid, email, display_name, role, is_active)
                     VALUES (?, ?, ?, ?, 'admin', true)`,
                    [uuidv4(), uid, email, displayName]
                );
            }
            console.log('✅ Admin user ready!');
            console.log(`Login with: ${email} / ${password}`);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Failed to create admin:', error);
    } finally {
        // Close pool
        await pool.end(); // Or process.exit
        process.exit(0);
    }
}

createAdmin();
