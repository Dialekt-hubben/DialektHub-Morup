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
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

    const likeQuery = query
        ? and(
              like(
                  sql`lower(${nationalWordTable.word})`,
                  `%${query.toLowerCase()}%`,
              ),
              undefined,
          )
        : undefined;

    const rawData = await db
        .select({
            id: dialectWordTable.id,
            word: dialectWordTable.word,
            pronunciation: dialectWordTable.pronunciation,
            phrase: dialectWordTable.phrase,
            status: dialectWordTable.status,
            userName: user.name,
            nationalWord: nationalWordTable.word,
            soundFileUrl: soundFileTable.url,
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
        .where(likeQuery)
        .limit(paginationSize)
        .offset(paginationOffset);

    const totalResults = await db
        .select({ value: count() })
        .from(dialectWordTable)
        .leftJoin(
            nationalWordTable,
            eq(dialectWordTable.nationalWordId, nationalWordTable.id),
        )
        .where(likeQuery);

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

    const { word, pronunciation, audioFile } = fileParseResult.data;
    const audioFileName = audioFile ? audioFile.name.toLowerCase() : null;

    if (audioFile && audioFileName) {
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: audioFileName,
            Body: Buffer.from(await audioFile.arrayBuffer()),
            ContentType: audioFile.type,
        });
        await s3Client.send(command);
    }

    // Använd en transaktion för att säkerställa att alla steg lyckas eller misslyckas tillsammans
    await db.transaction(async (tx) => {
        const nationalWordId = (
            await tx
                .insert(nationalWordTable)
                .values({ word: pronunciation })
                .returning({ id: nationalWordTable.id })
        )[0];

        let soundFileId: { id: number } | undefined = undefined;
        if (audioFile && audioFileName) {
            soundFileId = (
                await tx
                    .insert(soundFileTable)
                    .values({
                        fileName: audioFileName,
                        url: `/uploads/${audioFileName}`,
                    })
                    .returning({ id: soundFileTable.id })
            ).at(0);
        }

        await tx.insert(dialectWordTable).values({
            word,
            pronunciation,
            userId: currentUser.user.id,
            nationalWordId: nationalWordId.id,
            soundFileId: soundFileId ? soundFileId.id : undefined,
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

    // Skapa ett schema som matchar det vi skickar från frontend och validera det
    const updateWord = {
        id: data.id,
        dialectWord: data.word,
        nationalWord: data.nationalWord,
    };

    if (
        typeof updateWord.id !== "number" ||
        typeof updateWord.dialectWord !== "string" ||
        typeof updateWord.nationalWord !== "string"
    ) {
        throw new Error(
            "Ogiltig data: id, dialectWord och nationalWord krävs.",
        );
    }

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
