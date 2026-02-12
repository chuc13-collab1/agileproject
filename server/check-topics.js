import pool from './config/database.js';

async function checkTopics() {
    try {
        console.log('\n=== ALL TOPICS ===');
        const [topics] = await pool.query(`
            SELECT 
                t.id, 
                t.title, 
                t.supervisor_id,
                u.display_name as supervisor_name,
                t.current_students, 
                t.max_students, 
                t.status 
            FROM topics t
            LEFT JOIN users u ON t.supervisor_id = u.id
            ORDER BY t.created_at DESC
        `);
        console.table(topics);

        console.log('\n=== ALL PROJECTS ===');
        const [projects] = await pool.query(`
            SELECT 
                p.id,
                p.topic_id,
                p.student_id,
                p.status
            FROM projects p
        `);
        console.table(projects);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTopics();
