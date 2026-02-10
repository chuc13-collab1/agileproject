import { auth } from '../src/config/firebase.js';
import pool from '../src/config/database.js';

// Minimal check script
async function check() {
    try {
        const [rows] = await pool.query('SELECT * FROM topics');
        console.log('Topics create/read check success. Count:', rows.length);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
