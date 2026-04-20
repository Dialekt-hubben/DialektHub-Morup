"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { s3Client } from "@/lib/s3Client";
import {
    addDialectWord,
    updateDialectWord,
} from "@/types/DialektFormValidation/dialectWord";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";
import { Status } from "@/types/status";
import { GetNumberFromStatus } from "@/utils/enumConverter";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { count, eq, sql, like, or, and } from "drizzle-orm";
import { headers } from "next/headers";

type GetParams = {
    query: string;
    page: number;
    pageSize: number;
};

export async function GetAllDialectwords({ query, page, pageSize }: GetParams) {
    const paginationSize = pageSize;
    const paginationOffset = (page - 1) * pageSize;

    const caseInsensitiveWordFilter = query
        ? and(
              like(sql`lower(${nationalWordTable.word})`, `%${query}%`),
              eq(dialectWordTable.status, 1), // Only show approved words when searching
          )
        : eq(dialectWordTable.status, 1); // Only show approved words when no search query is provided;

    const rawData = await db
        .select({
            id: dialectWordTable.id,
            word: dialectWordTable.word,
            status: dialectWordTable.status,
            userName: user.name,
            nationalWord: nationalWordTable.word,
            fileName: soundFileTable.fileName,
        })
        .from(dialectWordTable)
        .leftJoin(user, eq(dialectWordTable.userId, user.id))
        .leftJoin(
            nationalWordTable,
            eq(dialectWordTable.nationalWordId, nationalWordTable.id),
        )
        .leftJoin(
            soundFileTable,
            eq(dialectWordTable.soundFileId, soundFileTable.id),
        )
        .where(caseInsensitiveWordFilter)
        .limit(paginationSize)
        .offset(paginationOffset);

    const totalResults = await db
        .select({ value: count() })
        .from(dialectWordTable)
        .leftJoin(
            nationalWordTable,
            eq(dialectWordTable.nationalWordId, nationalWordTable.id),
        )
        .where(caseInsensitiveWordFilter);

    return {
        rawData: rawData.map((item) => ({
            ...item,
            // Ensure that the status is one of the defined enum values, defaulting to "pending" if it's not valid
            status: Status.enum.approved,
        })),
        totalResults: Number(totalResults[0].value),
    };
}

export async function CreateDialectWord(data: addDialectWord) {
    const currentUser = await auth.api.getSession({
        headers: await headers(),
    });

    if (!currentUser) {
        throw new Error("User must be logged in to create a dialect word.");
    }

    const fileParseResult = dialectWordApi.safeParse(data);

    if (!fileParseResult.success) {
        throw new Error(
            "Invalid input data: " +
                JSON.stringify(fileParseResult.error.message),
        );
    }

    // När vi skapar ett nytt ord och det redan finns ett nationellt ord behöver vi ta till vara på NationalWordId
    // och koppla det in inmatade DialectWord ifrån inputen.
    const { dialectWord, nationalWord, audioFile } = fileParseResult.data;
    const audioFileName = audioFile
        ? Date.now() + "-" + audioFile.name.toLowerCase()
        : null;
    const existingDialectWord = await db
        .select({ word: dialectWordTable.word })
        .from(dialectWordTable)
        .where(eq(dialectWordTable.word, dialectWord))
        .limit(1);

    const existingNationalWord = await db
        .select({ id: nationalWordTable.id })
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, nationalWord))
        .limit(1);

    const existingPair = await db
        .select({ id: dialectWordTable.id })
        .from(dialectWordTable)
        .where(
            and(
                eq(
                    dialectWordTable.word,
                    existingDialectWord.at(0)?.word || "",
                ),
                eq(
                    dialectWordTable.nationalWordId,
                    existingNationalWord.at(0)?.id || 0,
                ),
            ),
        );

    // Använd en transaktion för att säkerställa att alla steg lyckas eller misslyckas tillsammans
    // transactionen hanterar både skapandet av nationalordet och dialektordet, samt kopplingen mellan dem
    await db.transaction(async (transactionContext) => {
        // Kolla om det redan finns ett nationellt ord som matchar det inmatade, och hämta dess ID

        let nationalWordId = existingNationalWord.at(0)?.id;

        if (existingPair.length > 0) {
            throw new Error(
                "Detta dialektord och nationalord par finns redan i systemet.",
            );
        }

        if (!nationalWordId) {
            // Om det inte finns, skapa ett nytt nationellt ord och hämta dess ID
            const insertedNationalWord = await transactionContext
                .insert(nationalWordTable)
                .values({ word: nationalWord.toLowerCase() })
                .$returningId();
            nationalWordId = insertedNationalWord[0].id;
        }

        let soundFileId: { id: number } | undefined = undefined;
        if (audioFile && audioFileName) {
            const arraybuffer = await audioFile.arrayBuffer();
            const uploadParams = {
                Bucket: env.S3_BUCKET_NAME,
                Key: audioFileName,
                Body: new Uint8Array(arraybuffer),
                ContentType: audioFile.type,
            } satisfies PutObjectCommandInput;

            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            soundFileId = (
                await transactionContext
                    .insert(soundFileTable)
                    .values({
                        fileName: audioFileName,
                    })
                    .$returningId()
            ).at(0);
        }

        await transactionContext.insert(dialectWordTable).values({
            word: dialectWord.toLowerCase(),
            userId: currentUser.user.id,
            nationalWordId: nationalWordId,
            soundFileId: soundFileId ? soundFileId.id : undefined,
            status: GetNumberFromStatus(Status.enum.approved), // Sätter status till "approved" när ett nytt ord skapas
        });
    });
}

export async function UpdateDialectword(data: updateDialectWord) {
    const currentUser = await auth.api.getSession({
        headers: await headers(),
    });

    if (!currentUser) {
        throw new Error("User must be logged in to update a dialect word.");
    }

    const parsedData = updateDialectWord.safeParse(data);

    if (!parsedData.success) {
        throw new Error(
            "Ogiltig data: id, dialectWord och nationalWord krävs.",
        );
    }

    // Normalize the input words to ensure consistency in the database.
    const updateWord = parsedData.data;
    const normalizedDialectWord = updateWord.dialectWord.toLowerCase();
    const normalizedNationalWord = updateWord.nationalWord.toLowerCase();

    try {
        // Check if a dialect word with the given id exists.
        await db.transaction(async (transactionContext) => {
            const existingDialectWord = await transactionContext
                .select({ id: dialectWordTable.id })
                .from(dialectWordTable)
                .where(eq(dialectWordTable.id, updateWord.id))
                .limit(1);

            if (existingDialectWord.length === 0) {
                throw new Error(
                    "Kunde inte hitta dialektordet för det angivna id:t.",
                );
            }

            // Get the ID for the national word (nationalWord) from the nationalWordTable.
            const existingNationalWord = await transactionContext
                .select({ id: nationalWordTable.id })
                .from(nationalWordTable)
                .where(eq(nationalWordTable.word, normalizedNationalWord))
                .limit(1);

            let nationalWordId = existingNationalWord.at(0)?.id;

            // If there isn't an existing national word that matches the input, create a new one and use its ID.
            if (!nationalWordId) {
                const insertedNationalWord = await transactionContext
                    .insert(nationalWordTable)
                    .values({ word: normalizedNationalWord })
                    .$returningId();
                nationalWordId = insertedNationalWord[0].id;
            }

            // Block duplicate pairs of dialect word and national word.
            const duplicatePair = await transactionContext
                .select({ id: dialectWordTable.id })
                .from(dialectWordTable)
                .where(
                    and(
                        eq(dialectWordTable.word, normalizedDialectWord),
                        eq(dialectWordTable.nationalWordId, nationalWordId),
                        sql`${dialectWordTable.id} <> ${updateWord.id}`, // Exclude the current row from the duplicate check.
                    ),
                )
                .limit(1);

            if (duplicatePair.length > 0) {
                throw new Error(
                    "Det finns redan en identisk rad med dessa ord.",
                );
            }

            // If all checks pass, update the dialect word with the new values.
            await transactionContext
                .update(dialectWordTable)
                .set({
                    word: normalizedDialectWord,
                    nationalWordId,
                })
                .where(eq(dialectWordTable.id, updateWord.id));
        });
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Ett fel uppstod vid uppdatering av dialektordet.");
    }
    return {
        message: "Word updated successfully",
        data: {
            dialectWord: updateWord.dialectWord,
            nationalWord: updateWord.nationalWord,
        },
    };
}

export async function SearchDialectWords({ page, pageSize, query }: GetParams) {
    const paginationSize = pageSize;
    const paginationOffset = (page - 1) * pageSize;

    const words = await db
        .select({
            id: dialectWordTable.id,
            word: dialectWordTable.word,
            nationalWord: nationalWordTable.word,
        })
        .from(dialectWordTable)
        .leftJoin(
            nationalWordTable,
            eq(dialectWordTable.nationalWordId, nationalWordTable.id),
        )
        .where(
            or(
                like(dialectWordTable.word, `%${query}%`),
                like(nationalWordTable.word, `%${query}%`),
            ),
        )
        .limit(paginationSize)
        .offset(paginationOffset);

    return words;
}
