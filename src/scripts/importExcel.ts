import * as XLSX from "xlsx";
import db from "../Drizzle";
import { dialectWordTable } from "../Drizzle/models/DialectWord";
import { user as userTable } from "../Drizzle/models/auth-schema";
import { soundFileTable } from "../Drizzle/models/SoundFile";
import { nationalWordTable } from "../Drizzle/models/NationalWord";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const excelfile = XLSX.readFile("ordlista1.xlsx");
const pageName = excelfile.SheetNames[0];
const page = excelfile.Sheets[pageName];
const rows = XLSX.utils.sheet_to_json(page);

// Hämta eller skapa användare
async function getOrCreateUser(name: string, email: string) {
    const existing = await db
        .select()
        .from(userTable)
        .where(eq(userTable.name, name))
        .limit(1);
    if (existing.length > 0) return existing[0].id;

    await db.insert(userTable).values({
        id: String(randomUUID()), // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
        name,
        email,
        emailVerified: true,
        image: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    const createdUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.name, name))
        .limit(1);
    return createdUser[0].id;
}

// Hämta eller skapa nationellt ord
async function getOrCreateNationalWord(word: string) {
    const existing = await db
        .select()
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word))
        .limit(1);
    if (existing.length > 0) return existing[0].id;

    await db.insert(nationalWordTable).values({ word });

    const created = await db
        .select()
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word))
        .limit(1);
    return created[0].id;
}

// Hämta eller skapa soundfile för ett ord
async function getOrCreateSoundFile(fileName: string) {
    const existing = await db
        .select()
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName))
        .limit(1);
    if (existing.length > 0) return existing[0].id;

    await db.insert(soundFileTable).values({
        fileName,
        url: `s3data/soundfiles/${fileName}`,
    });

    const created = await db
        .select()
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName))
        .limit(1);
    return created[0].id;
}

async function importWords() {
    // Skapa/hämta användare
    const userId = await getOrCreateUser("Håkan Petersson", "hakan@glommen.eu");

    for (const row of rows as { [key: string]: string }[]) {
        await db.insert(dialectWordTable).values({
            word: row["A"], // Vi måste hämta det första ordet om det finns mer än 1 ord.
            phrase: null,
            pronunciation: row["B"], // Vi måste hämta det första ordet om det finns mer än 1 ord.
            status: 1, // 1 för att ordet kommer ifrån Håkan.
            userId, // Ska vara Håkans userId
            nationalWordId: await getOrCreateNationalWord(row["B"]),
            soundFileId: await getOrCreateSoundFile(`${row["A"]}.mp3`),
        });
    }
    console.log("Import klar!");
}

importWords();
