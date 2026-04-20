"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { env } from "@/env";
import { auth, getAdminSession } from "@/lib/auth";
import { s3Client } from "@/lib/s3Client";
import {
    addDialectWord,
    updateDialectWord,
} from "@/types/DialektFormValidation/dialectWord";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";
import { Status } from "@/types/status";
import { GetNumberFromStatus } from "@/utils/enumConverter";
import {
    DeleteObjectCommand,
    DeleteObjectCommandInput,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
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
              like(
                  sql`lower(${nationalWordTable.word})`,
                  `%${query.toLowerCase()}%`,
              ),
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

export async function UpdateDialectWord(data: updateDialectWord) {
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

    const updateWord = parsedData.data;

    try {
        // Uppdaterar dialektordet i databasen med det nya värdet
        await db
            .update(dialectWordTable)
            .set({ word: updateWord.dialectWord })
            .where(eq(dialectWordTable.id, updateWord.id));

        // Hämta nationalWordId för att kunna uppdatera nationalordet
        const fetchedNationalWordId = await db
            .select({ nationalWordId: dialectWordTable.nationalWordId })
            .from(dialectWordTable)
            .where(eq(dialectWordTable.id, updateWord.id));

        // Om nationalWordId finns, uppdatera nationalordet i databasen
        if (fetchedNationalWordId.length > 0) {
            await db
                .update(nationalWordTable)
                .set({ word: updateWord.nationalWord })
                .where(
                    eq(
                        nationalWordTable.id,
                        fetchedNationalWordId[0].nationalWordId,
                    ),
                );
        } else {
            throw new Error(
                "Kunde inte hitta nationalWordId för det angivna id:t.",
            );
        }
    } catch {
        throw new Error("Ett fel uppstod vid uppdatering av dialektordet.");
    }
    return {
        message: "Word updated successfully",
        data: {
            dialectWord: updateWord.dialectWord,
            nationalWord: updateWord.nationalWord,
        },
    };
}

export async function UpdateDialectWordStatus(
    dialectWordId: number,
    newStatus: Status,
) {
    const currentUser = await getAdminSession();

    if (!currentUser) {
        throw new Error("User must be logged in to update a dialect word.");
    }

    try {
        if (
            newStatus === Status.enum.approved ||
            newStatus === Status.enum.pending
        ) {
            await db
                .update(dialectWordTable)
                .set({ status: GetNumberFromStatus(newStatus) })
                .where(eq(dialectWordTable.id, dialectWordId));
        }
        if (newStatus === Status.enum.rejected) {
            const wordToDelete = (
                await db
                    .select({
                        soundFileName: soundFileTable.fileName,
                    })
                    .from(dialectWordTable)
                    .leftJoin(
                        soundFileTable,
                        eq(dialectWordTable.soundFileId, soundFileTable.id),
                    )
                    .where(eq(dialectWordTable.id, dialectWordId))
                    .limit(1)
            ).at(0);

            // Om det finns en ljudfil kopplad till ordet, ta bort den från S3
            if (wordToDelete && wordToDelete.soundFileName) {
                const deleteCommandInput = {
                    Bucket: env.S3_BUCKET_NAME,
                    Key: wordToDelete.soundFileName,
                } satisfies DeleteObjectCommandInput;
                const deleteCommand = new DeleteObjectCommand(
                    deleteCommandInput,
                );
                await s3Client.send(deleteCommand);

                await db
                    .delete(dialectWordTable)
                    .where(eq(dialectWordTable.id, dialectWordId));

                await db
                    .delete(soundFileTable)
                    .where(
                        eq(soundFileTable.fileName, wordToDelete.soundFileName),
                    );
                return;
            }

            await db
                .delete(dialectWordTable)
                .where(eq(dialectWordTable.id, dialectWordId));
        }
    } catch {
        throw new Error(
            "Ett fel uppstod vid uppdatering av dialektordets status.",
        );
    }
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
