import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "src/Drizzle/migrations",
    schema: "src/Drizzle/models/*.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
