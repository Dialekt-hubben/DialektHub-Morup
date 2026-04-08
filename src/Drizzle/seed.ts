import fs from "fs";
import "dotenv/config";
import db from ".";
import { dialectWordTable } from "./models/DialectWord";
import { nationalWordTable } from "./models/NationalWord";
import { soundFileTable } from "./models/SoundFile";
import { user } from "./models/auth-schema";

const parseJsonFile = <T>(filePath: string): T => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const cleaned = raw.replace(/^\uFEFF/, ""); // Ta bort eventuella BOM-tecken
    return JSON.parse(cleaned) as T;
};

async function main() {
    //user seed
    // const userSeed = fs.readFileSync(
    //     "src/Drizzle/SeedData/user_seed.json",
    //     "utf-8",
    // );
    // const userData: typeof user.$inferInsert = JSON.parse(userSeed);
    // await db.insert(user).values(userData);

    //user seed
    const userData: typeof user.$inferInsert = 
        parseJsonFile("src/Drizzle/SeedData/user_seed.json");
    await db.insert(user).values(userData);

    //national word
    const nationalWordData: typeof nationalWordTable.$inferInsert =
        parseJsonFile("src/Drizzle/SeedData/NationalWord_seed.json");
    await db.insert(nationalWordTable).values(nationalWordData);

    //sound file
    const soundFileData: typeof soundFileTable.$inferInsert =
        parseJsonFile("src/Drizzle/SeedData/Soundfile_seed.json");
    await db.insert(soundFileTable).values(soundFileData);

    //dialect word
    const dialectWordData: typeof dialectWordTable.$inferInsert =
        parseJsonFile("src/Drizzle/SeedData/DialectWord_seed.json");
    await db.insert(dialectWordTable).values(dialectWordData);
}

main()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });