// query-check.js
import mysql from 'mysql2/promise';

async function check() {
    const c = await mysql.createConnection({
        host: 'gondola.proxy.rlwy.net', port: 37932,
        user: 'root', password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk', database: 'railway'
    });

    const tables = ['users', 'students', 'teachers', 'classes', 'topics', 'projects'];
    for (const t of tables) {
        const [res] = await c.query(`SELECT COUNT(*) as c FROM ${t}`);
        console.log(`${t}: ${res[0].c} records`);
    }

    console.log('\n--- USERS BY ROLE ---');
    const [u] = await c.query('SELECT role, COUNT(*) as c FROM users GROUP BY role');
    console.table(u);

    console.log('\n--- ADMIN TABLE ---');
    const [admins] = await c.query('SELECT * FROM admins');
    console.table(admins);

    await c.end();
}
check();
