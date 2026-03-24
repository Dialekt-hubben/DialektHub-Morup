"use server";

import db from "@/Drizzle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";

// Typ för en rad från Excel-filen
export type ExcelWordRow = {
    dialectWord: string;
    nationalWord: string;
};

// Hämta eller skapa nationellt ord
async function getOrCreateNationalWord(word: string) {
    const existing = await db
        .select({ id: nationalWordTable.id })
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word));
    if (existing.length > 0) {
        return existing[0].id;
    }
    await db.insert(nationalWordTable).values({ word });
    const createdNationalWord = await db
        .select({ id: nationalWordTable.id })
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word));
    return createdNationalWord[0].id;
}

async function getOrCreateSoundFile(fileName: string) {
    const existing = await db
        .select({ id: soundFileTable.id })
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName));
    if (existing.length > 0) return existing[0].id;

    await db.insert(soundFileTable).values({
        fileName,
        url: `s3data/soundfiles/${fileName}`,
    });

    const createdSoundFile = await db
        .select({ id: soundFileTable.id })
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName));
    return createdSoundFile[0].id;
}

// Receive a row and check if it should be imported or skipped
// export async function processExcelRow( row: ExcelWordRow, ): Promise<{ skip: boolean; dialectWord?: string; nationalWord?: string }> {
//     const { dialectWord, nationalWord } = row;
//     // Logik för att avgöra om raden ska importeras eller hoppas över
//     return { skip: false, dialectWord, nationalWord };
// }

// Tar emot en array av rader och sparar dem i databasen (endast dialektalt och nationellt ord)
export async function importExcelRows(rows: ExcelWordRow[]) {
    const currentUser = await auth.api.getSession({
        headers: await headers(),
    });
    if (!currentUser) {
        throw new Error("User must be logged in to import words.");
    }

    let failedInserts: ExcelWordRow[] = [];
    for (const row of rows) {
        const nationalWordId = await getOrCreateNationalWord(row.nationalWord);
        const soundFileId = await getOrCreateSoundFile(
            `${row.dialectWord}.mp3`,
        );

        // Om något är fel med nationalWordId eller soundFileId,
        // logga felet, lägg inte till raden och fortsätt till nästa rad.
        if (!nationalWordId || !soundFileId) {
            console.error(
                `Failed to get or create national word or sound file for row: ${JSON.stringify(row)}
                )}`,
            );
            failedInserts.push(row);
            continue;
        }

        // Om allt är okej, lägg till raden i databasen
        await db.insert(dialectWordTable).values({
            word: row.dialectWord,
            nationalWordId,
            soundFileId,
            userId: currentUser.user.id,
        });

        console.log("[+] Adding:", { row });
    }
    return {
        message: "Import klar!\n",
        totalRowsAdded: rows.length - failedInserts.length,
        failedInserts,
    };
}

// Ska vi ens ha status?
