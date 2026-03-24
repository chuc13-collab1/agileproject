import 'dotenv/config';
import db from './src/config/database.js';

async function run() {
    console.log("Connected. Fixing projects...");
    try {
        const [projects] = await db.query(`
            SELECT id, supervisor_score, reviewer_score, council_score 
            FROM projects 
            WHERE supervisor_score IS NOT NULL 
              AND reviewer_score IS NOT NULL 
              AND status IN ('in_progress', 'submitted', 'registered')
        `);

        console.log(`Found ${projects.length} projects to fix.`);

        let count = 0;
        for (const p of projects) {
            let finalScore = p.supervisor_score * 0.4 + p.reviewer_score * 0.2;
            if (p.council_score) {
                finalScore += p.council_score * 0.4;
            }
            finalScore = parseFloat(finalScore.toFixed(2));

            let grade;
            if (finalScore >= 9.0) grade = 'A';
            else if (finalScore >= 8.5) grade = 'B+';
            else if (finalScore >= 8.0) grade = 'B';
            else if (finalScore >= 7.5) grade = 'C+';
            else if (finalScore >= 7.0) grade = 'C';
            else if (finalScore >= 6.5) grade = 'D+';
            else if (finalScore >= 6.0) grade = 'D';
            else grade = 'F';

            await db.query(
                `UPDATE projects 
                 SET final_score = ?, grade = ?, status = 'graded', updated_at = NOW() 
                 WHERE id = ?`,
                [finalScore, grade, p.id]
            );
            count++;
        }
        console.log("Fixed projects count:", count);
    } catch (err) {
        console.error("Query error:", err);
    }
    
    // Give it a moment to finish logging
    setTimeout(() => process.exit(0), 1000);
}
run().catch(console.error);

