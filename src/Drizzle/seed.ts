import fs from "fs";
import "dotenv/config";
import db from ".";
import { dialectWordTable } from "./models/DialectWord";
import { nationalWordTable } from "./models/NationalWord";
import { soundFileTable } from "./models/SoundFile";
import { user } from "./models/auth-schema";

async function main() {
    //user seed
    const userSeed = fs.readFileSync(
        "src/Drizzle/SeedData/user_seed.json",
        "utf-8",
    );
    const userData: typeof user.$inferInsert = JSON.parse(userSeed);
    await db.insert(user).values(userData);

    //national word
    const nationalWordSeed = fs.readFileSync(
        "src/Drizzle/SeedData/NationalWord_seed.json",
        "utf-8",
    );
    const nationalWordData: typeof nationalWordTable.$inferInsert =
        JSON.parse(nationalWordSeed);
    await db.insert(nationalWordTable).values(nationalWordData);

    //sound file
    const soundFileSeed = fs.readFileSync(
        "src/Drizzle/SeedData/Soundfile_seed.json",
        "utf-8",
    );
    const soundFileData: typeof soundFileTable.$inferInsert =
        JSON.parse(soundFileSeed);
    await db.insert(soundFileTable).values(soundFileData);

    //dialect word
    const dialectWord = fs.readFileSync(
        "src/Drizzle/SeedData/DialectWord_seed.json",
        "utf-8",
    );
    const dialectWordData: typeof dialectWordTable.$inferInsert =
        JSON.parse(dialectWord);
    await db.insert(dialectWordTable).values(dialectWordData);
}

main();
