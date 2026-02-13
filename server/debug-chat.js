import db from './src/config/database.js';

async function debug() {
    try {
        // Check if topics.supervisor_id matches users.id instead of teachers.id
        const [r] = await db.query(`
      SELECT t.title, t.supervisor_id,
        u_direct.display_name as direct_user_name,
        u_direct.uid as direct_user_uid,
        te.id as teacher_table_id
      FROM topics t
      LEFT JOIN users u_direct ON t.supervisor_id = u_direct.id
      LEFT JOIN teachers te ON t.supervisor_id = te.id
      WHERE t.supervisor_id IS NOT NULL
    `);
        console.log('=== Topics supervisor_id type check ===');
        r.forEach(x => {
            console.log(`${x.title}`);
            console.log(`  supervisor_id: ${x.supervisor_id}`);
            console.log(`  matches users.id? ${x.direct_user_name || 'NO'} (uid: ${x.direct_user_uid || 'N/A'})`);
            console.log(`  matches teachers.id? ${x.teacher_table_id || 'NO'}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}
debug();
