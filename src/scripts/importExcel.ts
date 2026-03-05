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

// Hjälpfunktion: hämta eller skapa användare
async function getOrCreateUser(name: string, email: string) {
    const existing = await db
        .select()
        .from(userTable)
        .where(eq(userTable.name, name))
        .limit(1);
    if (existing.length > 0) return existing[0].id;
    await db.insert(userTable).values({
        id: String(randomUUID()),
        name,
        email,
        emailVerified: false,
        image: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    const created = await db
        .select()
        .from(userTable)
        .where(eq(userTable.name, name))
        .limit(1);
    return created[0].id;
}

// Hjälpfunktion: hämta eller skapa nationellt ord
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

// Hjälpfunktion: hämta eller skapa soundfile för ett ord
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
        // Skapa/hämta nationellt ord
        const nationalWordId = await getOrCreateNationalWord(row["B"]);

        // Skapa/hämta soundfile för dialektordet
        const soundFileId = await getOrCreateSoundFile(`${row["A"]}.mp3`);

        // Lägg in dialektordet
        await db.insert(dialectWordTable).values({
            word: row["A"],
            phrase: null,
            pronunciation: row["B"],
            status: 1,
            userId,
            nationalWordId,
            soundFileId,
        });
    }
    console.log("Import klar!");
}

importWords();
