"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { count, eq, sql, like } from "drizzle-orm";

type params = {
    query: string;
    page: number;
    pageSize: number;
};

export async function GetAllDialectwords({ query, page, pageSize }: params) {
    const paginationSize = pageSize;
    const paginationOffset = (page - 1) * pageSize;

    const statusMap = {
        0: "pending",
        1: "approved",
        2: "rejected",
    } as const; // 'as const' makes the object readonly and preserves literal types

    const likeQuery = query
        ? like(sql`lower(${nationalWordTable.word})`, `%${query.toLowerCase()}%`)
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
            status: statusMap[item.status as keyof typeof statusMap] ?? "pending",
        })),
        totalResults: Number(totalResults[0].value),
    };
}
