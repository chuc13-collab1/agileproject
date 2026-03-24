import mysql from 'mysql2/promise';
import fs from 'fs/promises';

async function exportDatabase() {
    console.log("Connecting to Railway database...");
    const conn = await mysql.createConnection({
        host: 'gondola.proxy.rlwy.net',
        port: 37932,
        user: 'root',
        password: 'jYJxrYBCOUzRcIOxwuxFiqgXWeksiVTk',
        database: 'railway'
    });

    try {
        const [tables] = await conn.query("SHOW TABLES");
        let sqlDump = "-- Database Export from Railway\n\n";

        for (let row of tables) {
            const tableName = Object.values(row)[0];
            const [createTableResult] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
            sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sqlDump += createTableResult[0]['Create Table'] + ";\n\n";

            const [data] = await conn.query(`SELECT * FROM \`${tableName}\``);
            if (data.length > 0) {
                sqlDump += `INSERT INTO \`${tableName}\` VALUES \n`;
                const values = data.map(record => {
                    return "(" + Object.values(record).map(val => {
                        if (val === null) return "NULL";
                        if (typeof val === "string") return "'" + val.replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
                        if (val instanceof Date) {
                            if (isNaN(val.getTime())) return "NULL";
                            return "'" + val.toISOString().slice(0, 19).replace('T', ' ') + "'";
                        }
                        return val;
                    }).join(", ") + ")";
                });
                sqlDump += values.join(",\n") + ";\n\n";
            }
        }

        await fs.writeFile('railway_database_backup.sql', sqlDump, 'utf8');
        console.log("✅ Backup saved successfully to railway_database_backup.sql");

    } catch (err) {
        console.error("❌ Error exporting database:", err);
    } finally {
        await conn.end();
    }
}

exportDatabase();
