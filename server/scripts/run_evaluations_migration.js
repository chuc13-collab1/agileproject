import mysql from 'mysql2/promise';

async function run() {
    const conn = await mysql.createConnection({
        host: 'gondola.proxy.rlwy.net',
        port: 37932,
        user: 'root',
        password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk',
        database: 'railway',
        multipleStatements: true,
    });

    console.log('Connected to DB');

    const sql = `
    CREATE TABLE IF NOT EXISTS \`evaluations\` (
      \`id\` varchar(36) NOT NULL COMMENT 'UUID',
      \`project_id\` varchar(36) NOT NULL,
      \`evaluator_id\` varchar(36) NOT NULL COMMENT 'Teacher UUID',
      \`evaluator_type\` enum('supervisor','reviewer','council') NOT NULL,
      \`criteria_score\` json DEFAULT NULL COMMENT 'JSON storing detailed scores',
      \`total_score\` decimal(4,2) DEFAULT NULL,
      \`comments\` text DEFAULT NULL,
      \`strengths\` text DEFAULT NULL,
      \`weaknesses\` text DEFAULT NULL,
      \`suggestions\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`unique_evaluation\` (\`project_id\`, \`evaluator_id\`, \`evaluator_type\`),
      CONSTRAINT \`fk_evaluations_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_evaluations_teacher\` FOREIGN KEY (\`evaluator_id\`) REFERENCES \`teachers\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
        await conn.query(sql);
        console.log('✅ Created evaluations table successfully.');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    }

    await conn.end();
}

run();
