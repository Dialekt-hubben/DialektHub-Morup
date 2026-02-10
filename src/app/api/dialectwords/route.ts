import db from "@/Drizzle";
import { sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { user } from "@/Drizzle/models/auth-schema";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";

// TypeScript interface for the API response
interface DialectWordResponse {
    paginationOffset: number;
    page: number;
    paginationSize: number;
    total: number;
    data: Array<{
        id: number;
        word: string;
        pronunciation: string | null;
        phrase: string | null;
        status: "pending" | "approved" | "rejected";
        userName: string | null;
        nationalWord: string | null;
        soundFileUrl: string | null;
    }>;
    error?: string;
}

// API-route to fetch paginated dialect words data
export async function GET(req: NextRequest) {
    try {
        // Get query parameters (page number and page size)
        const { searchParams } = new URL(req.url); // Ex: /api/dialectwords?page=1&pageSize=10

        let page = parseInt(searchParams.get("page") || "1", 10); // Default: page 1
        // page must be >= 1
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        let paginationSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default: 10 rows per page
        // pageSize must be >= 1
        if (isNaN(paginationSize) || paginationSize < 1) {
            paginationSize = 10;
        }

        // Calculate offset for SQL query (for pagination)
        const paginationOffset = (page - 1) * paginationSize;

        // Maps "status" number to a specific string
        const statusMap = {
            0: "pending",
            1: "approved",
            2: "rejected",
        } as const; // 'as const' makes the object readonly and preserves literal types

        // Get total number of rows in the table (to be able to show number of pages)
        const [{ count }] = await db
            .select({ count: sql`COUNT(*)` })
            .from(dialectWordTable);
        const total = Number(count);

        // Fetch data from the database with join against user, national word, and sound file
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
            .limit(paginationSize)
            .offset(paginationOffset);

        // Transforming the number in "status" to fixed string values
        const data = rawData.map((item) => ({
            ...item,
            status:
                statusMap[item.status as keyof typeof statusMap] ?? "pending",
        }));

        // Return data and pagination info as JSON to frontend
        const response: DialectWordResponse = {
            paginationOffset,
            page,
            paginationSize,
            total,
            data,
        };

        // Return successful response as JSON
        return NextResponse.json(response);

        // if error, return error as JSON with statuscode 500 and reset all fields to default values.
    } catch (errorr) {
        if (errorr instanceof Error) {
            const response: DialectWordResponse = {
                paginationOffset: 0,
                page: 1,
                paginationSize: 10,
                total: 0,
                data: [],
                error: errorr.message || "Något gick fel vid hämtning av data.",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
