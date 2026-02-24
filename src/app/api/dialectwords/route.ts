import db from "@/Drizzle";
import { sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { soundFileTable } from "@/Drizzle/models/SoundFile";
import { addDialectWord, DialectWordTableResponse } from "@/types/dialectword";
import { auth } from "@/lib/auth";
import { user } from "@/Drizzle/models/auth-schema";

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
        const response: DialectWordTableResponse = {
            paginationOffset,
            page,
            paginationSize,
            total,
            data,
        };

        // Return successful response as JSON
        return NextResponse.json(response);

        // if error, return error as JSON with statuscode 500 and reset all fields to default values.
    } catch (error) {
        if (error instanceof Error) {
            const response: DialectWordTableResponse = {
                paginationOffset: 0,
                page: 1,
                paginationSize: 10,
                total: 0,
                data: [],
                error: error.message || "Något gick fel vid hämtning av data.",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}

export async function POST(req: NextRequest) {
    const currentUser = await auth.api.getSession(req);

    if (!currentUser) {
        return NextResponse.json(
            { error: "Unauthorized: User must be logged in to add a dialect word." },
            { status: 401 },
        );
    }

    const formData = await req.formData();
    const response = addDialectWord.safeParse(Object.fromEntries(formData.entries()));

    if (!response.success) {
        return NextResponse.json(
            { error: "Ogiltig data: " + response.error.message },
            { status: 400 },
        );
    }

    const addData = response.data;


    // Kolla om det nationella ordet redan finns i databasen, 
    // om inte skapa det nationella ordet och hämta dess id,
    // om det finns, hämta dess id och använd det för att skapa dialektordet.
    





    // kolla om det nationella ordet redan finns i databasen.
    // hittar vi ett ord som matchar så neka skapandet av dialektordet och returnera ett felmeddelande,
    // hittar vi inte ett ord som matchar så skapa det nationella ordet och använd dess id för att skapa dialektordet.


    // check if nationalword excist in database

    return NextResponse.json({ message: "Word added successfully" });
    // const nationalWordExists = await db.select()
    //     .from(nationalWordTable)
    //     .where(eq(nationalWordTable.word, addData.word));


    //     try { if (nationalWordExists.length === 0) {
    //             const newNationalWord = await db.insert(nationalWordTable).values({
    //                 word: addData.word,
    //             });
    //         }
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return NextResponse.json(
    //                 { error: error.message || "Något gick fel vid skapandet av det nationella ordet." },
    //                 { status: 500 },
    //             );
    //         }
    //     }


    // try {
    //     const newDialectWord = await db.insert(dialectWordTable).values({
    //         word: addData.word,
    //         pronunciation: addData.pronunciation,
    //         // phrase: addData.phrase,
    //         // status: 0, // Default status is "pending"
    //         userId: currentUser.session.id,
    //         nationalWordId: addData.pronunciation,
    //         soundFileId: addData.audioFile,
    //     });
    // } catch (error) {
    //     if (error instanceof Error) {
    //         return NextResponse.json(
    //             { error: error.message || "Något gick fel vid skapandet av dialektordet." },
    //             { status: 500 },
    //         );
    //     }
    // }
}
