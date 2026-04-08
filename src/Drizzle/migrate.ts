import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";
import db, { connection } from ".";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isConnectionRefusedError = (connectionError: unknown) => {
    
    // Kollar om felet är ett "ECONNREFUSED"-fel, vilket indikerar att databasen inte är redo än.
    if (!connectionError || typeof connectionError !== "object") {
        return false;
    }

    // Kollar flera möjliga platser där "ECONNREFUSED" kan dyka upp.
    const candidate = connectionError as {
        code?: string;
        message?: string;
        cause?: { code?: string; message?: string };
    };

    return (
        candidate.code === "ECONNREFUSED" ||
        candidate.cause?.code === "ECONNREFUSED" ||
        candidate.message?.includes("ECONNREFUSED") ||
        candidate.cause?.message?.includes("ECONNREFUSED")
    );
};

// Köra migreringar och om det misslyckas på grund av att databasen inte är redo,
// så väntar den och försöker igen upp till 10/maxAttempts gånger.
const runMigration = async () => {
    console.log("⏳ Kör migreringar...");
    try {
        const maxAttempts = 10;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await migrate(db, {
                    // Peka på mappen där dina .sql-filer hamnar
                    migrationsFolder: path.join(__dirname, "migrations"),
                });
                break;
            } catch (err) {
                const isLastAttempt = attempt === maxAttempts;

                if (isLastAttempt || !isConnectionRefusedError(err)) {
                    throw err;
                }

                console.warn(
                    `Databasen är inte redo (försök ${attempt}/${maxAttempts}), försöker igen...`,
                );
                await wait(2000);
            }
        }
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
