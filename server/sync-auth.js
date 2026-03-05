// sync-auth.js
import mysql from 'mysql2/promise';
import { auth } from './src/config/firebase.js';

const db = await mysql.createPool({
    host: 'gondola.proxy.rlwy.net', port: 37932,
    user: 'root', password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk', database: 'railway'
});

async function syncUsers() {
    const c = await db.getConnection();
    try {
        const [users] = await c.query('SELECT id, email, role FROM users');
        console.log(`Checking ${users.length} users in MySQL...`);

        let synced = 0, created = 0, failed = 0;

        for (const u of users) {
            if (u.role === 'admin') continue; // Skip admin, already ok usually

            let fbUser;
            try {
                fbUser = await auth.getUserByEmail(u.email);

                // Update MySQL UID if different
                await c.query('UPDATE users SET uid = ? WHERE id = ?', [fbUser.uid, u.id]);
                synced++;
                console.log(`Synced ${u.email} -> UID: ${fbUser.uid}`);
            } catch (e) {
                if (e.code === 'auth/user-not-found') {
                    // Create in Firebase
                    const password = u.role === 'student' ? 'Student@2026' : 'Teacher@2026'; // Default passwords
                    try {
                        fbUser = await auth.createUser({
                            email: u.email,
                            password: password,
                            displayName: u.email.split('@')[0]
                        });
                        await c.query('UPDATE users SET uid = ? WHERE id = ?', [fbUser.uid, u.id]);
                        created++;
                        console.log(`Created ${u.email} -> UID: ${fbUser.uid}`);
                    } catch (createErr) {
                        failed++;
                        console.log(`Failed to create ${u.email}:`, createErr.message);
                    }
                } else {
                    failed++;
                    console.log(`Error checking ${u.email}:`, e.message);
                }
            }
        }

        console.log(`\nSync complete. Synced: ${synced}, Created: ${created}, Failed: ${failed}`);
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        c.release();
        process.exit(0);
    }
}

syncUsers();
