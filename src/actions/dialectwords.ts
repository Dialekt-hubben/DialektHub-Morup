"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { s3Client } from "@/lib/s3Client";
import { addDialectWord } from "@/types/DialektFormValidation/dialectWord";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";
import { Status } from "@/types/status";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { count, eq, sql, like } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

type GetParams = {
    query: string;
    page: number;
    pageSize: number;
};

const GetStatusFromNumber = (statusIndex: number | null): Status => {
    switch (statusIndex) {
        case 0:
            return "pending";
        case 1:
            return "approved";
        case 2:
            return "rejected";
        default:
            return "pending";
    }
};

export async function GetAllDialectwords({ query, page, pageSize }: GetParams) {
    const paginationSize = pageSize;
    const paginationOffset = (page - 1) * pageSize;

    const caseInsensitiveWordFilter = query
        ? like(
              sql`lower(${nationalWordTable.word})`,
              `%${query.toLowerCase()}%`,
          ) && // Case-insensitive search on the national word
          eq(dialectWordTable.status, 1) // Only show approved words when searching
        : eq(dialectWordTable.status, 1); // Only show approved words when no search query is provided;

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
            // This converts the numeric status from the database into a string representation for easier handling in the frontend
            // If status is null, it will default to "pending"
            status: GetStatusFromNumber(item.status),
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


export async function UpdateDialectword(data: dialectWordApi) {
    const currentUser = await auth.api.getSession();

    if (!currentUser) {
        throw new Error("User must be logged in to update a dialect word.");
    }

    // Todo: Move this schema to a separate file since it cam be used in multiple places
    const updateWordSchema = z.object({
        id: z.number(),
        dialectWord: z.string(),
        nationalWord: z.string(),
    });

    const parsedData = updateWordSchema.safeParse(data);

    if (!parsedData.success) {
        throw new Error("Ogiltig data: id, dialectWord och nationalWord krävs.");
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
