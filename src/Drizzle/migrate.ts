import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";
import db, { connection } from ".";

const runMigration = async () => {
    console.log("⏳ Kör migreringar...");

    try {
        await migrate(db, {
            // Peka på mappen där dina .sql-filer hamnar
            migrationsFolder: path.join(__dirname, "migrations"),
        });
        console.log("✅ Migreringar klara!");
    } catch (err) {
        console.error("❌ Migrering misslyckades:", err);
        process.exit(1);
    } finally {
        await connection.end();
        console.log("🔌 Databasanslutning stängd.");
    }
};

runMigration();
