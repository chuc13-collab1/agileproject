import mysql from 'mysql2/promise';

const checkDatabase = async () => {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Hoangtructien257@',
        database: 'agile_pm'
    });

    try {
        console.log('\n=== Checking current user ===');
        // Get current user from browser (you'll need to replace this with actual user_id)
        const currentUserId = 'oj6X0rxDGZfdXpfCjBqjGGi9VEl1'; // Replace with actual from browser

        console.log('\n=== Student Info ===');
        const [students] = await connection.query(`
      SELECT u.id as user_id, u.display_name, s.id as student_id, s.student_id as student_code 
      FROM users u 
      LEFT JOIN students s ON u.id = s.user_id 
      WHERE u.role = 'student' 
      LIMIT 5
    `);
        console.log(students);

        console.log('\n=== Projects for students ===');
        const [projects] = await connection.query(`
      SELECT p.*, s.student_id as student_code, u.display_name as student_name
      FROM projects p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE u.id = ?
    `, [currentUserId]);
        console.log(projects);

        console.log('\n=== Progress Reports ===');
        const [reports] = await connection.query(`
      SELECT pr.*, p.id as project_id
      FROM progress_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE u.id = ?
    `, [currentUserId]);
        console.log(reports);

        console.log('\n=== All progress_reports (first 5) ===');
        const [allReports] = await connection.query(`
      SELECT * FROM progress_reports LIMIT 5
    `);
        console.log(allReports);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
};

checkDatabase();
