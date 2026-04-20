"use server";

import db from "@/Drizzle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";

export type ExcelWordRow = {
    dialectWord: string;
    nationalWord: string;
};

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

async function CheckMachingRows(dialectWord: string, nationalWord: string) {
    // Get the ID for the national word (nationalWord) from the nationalWordTable
    const nationalWordRow = await db
        .select({ id: nationalWordTable.id })
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, nationalWord));

    // If the national word does not exist, return null (no match can be found)
    if (nationalWordRow.length === 0) {
        return null;
    }
    const nationalWordId = nationalWordRow[0].id;

    // Search in dialectWordTable for a row where both the dialect word and nationalWordId match
    const existing = await db
        .select({ id: dialectWordTable.id })
        .from(dialectWordTable)
        .where(
            and(
                eq(dialectWordTable.word, dialectWord),
                eq(dialectWordTable.nationalWordId, nationalWordId),
            ),
        );

    // If the row exists, return its id (i.e. this combination already exists)
    // Otherwise return null (the combination does not exist, so the row should be added)
    return existing.length > 0 ? existing[0].id : null;
}

// Receives an array of rows and saves them to the database (only dialect and national word)
export async function importExcelRows(rows: ExcelWordRow[]) {
    const currentUser = await auth.api.getSession({
        headers: await headers(),
    });
    if (!currentUser) {
        throw new Error("User must be logged in to import words.");
    }

    for (const row of rows) {
        const nationalWordId = await getOrCreateNationalWord(row.nationalWord);

        // if there was an issue getting or creating the national word, log an error and skip the row.
        // Also if the combination of dialect word and national word already exists, log a warning and skip the row.
        if (!nationalWordId) {
            console.error(
                `Failed to get or create national word or sound file for row: ${JSON.stringify(row)}`,
            );
            continue;
        } else if (await CheckMachingRows(row.dialectWord, row.nationalWord)) {
            console.warn(
                `Row already exists, skipping: ${JSON.stringify(row)}`,
            );
            continue;
        }

        // If everything is fine, insert the new words into the database.
        await db.insert(dialectWordTable).values({
            word: row.dialectWord,
            nationalWordId,
            userId: currentUser.user.id,
            status: 1,
        });

        console.log("[+] Adding:", { row });
    }
    return "Import klar!\n";
}
