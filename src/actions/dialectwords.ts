"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { auth } from "@/lib/auth";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";
import { Status } from "@/types/status";
import { count, eq, sql, like } from "drizzle-orm";
import Error from "next/error";

type GetParams = {
    query: string;
    page: number;
    pageSize: number;
};

export async function GetAllDialectwords({ query, page, pageSize }: GetParams) {
    const paginationSize = pageSize;
    const paginationOffset = (page - 1) * pageSize;

    const likeQuery = query
        ? like(
              sql`lower(${nationalWordTable.word})`,
              `%${query.toLowerCase()}%`,
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
            status: (Status.type[item.status] as Status) || Status.enum.pending,
        })),
        totalResults: Number(totalResults[0].value),
    };
}

export async function CreateDialectword(data: dialectWordApi) {
    const currentUser = await auth.api.getSession();

    if (!currentUser) {
        throw new Error({
            statusCode: 401,
            title: "Unauthorized",
            message: "User must be logged in to create a dialect word.",
        });
    }

    const fileParseResult = dialectWordApi.safeParse(data);

    if (!fileParseResult.success) {
        throw new Error({
            statusCode: 400,
            title: "Invalid input",
            message: "Ogiltig ljudfil: " + fileParseResult.error.message,
        });
    }

    console.log(fileParseResult.data);
}

export async function UpdateDialectword(data: dialectWordApi) {
    const currentUser = await auth.api.getSession();

    if (!currentUser) {
        throw new Error({
            statusCode: 401,
            title: "Unauthorized",
            message: "User must be logged in to update a dialect word.",
        });
    }

    // Skapa ett schema som matchar det vi skickar från frontend och validera det
    const updateWord = {
        id: formData.id,
        dialectWord: formData.dialectWord,
        nationalWord: formData.nationalWord,
    };

    if (
        typeof updateWord.id !== "number" ||
        typeof updateWord.dialectWord !== "string" ||
        typeof updateWord.nationalWord !== "string"
    ) {
        throw new Error({
            statusCode: 400,
            title: "Invalid input",
            message: "Ogiltig data: id, dialectWord och nationalWord krävs.",
        });
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
            throw new Error({
                statusCode: 404,
                title: "Not Found",
                message:
                    "Kunde inte hitta nationalWordId för det angivna id:t.",
            });
        }
    } catch {
        throw new Error({
            statusCode: 500,
            title: "Internal Server Error",
            message: "Ett fel uppstod vid uppdatering av dialektordet.",
        });
    }
    return {
        message: "Word updated successfully",
        data: {
            dialectWord: updateWord.dialectWord,
            nationalWord: updateWord.nationalWord,
        },
    };
}
