import { NextRequest, NextResponse } from "next/server";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";
import { dialectWordTable } from "@/Drizzle/models/DialectWord";
import { nationalWordTable } from "@/Drizzle/models/NationalWord";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import db from "@/Drizzle";

export async function POST(req: NextRequest) {
    const currentUser = await auth.api.getSession(req);

    if (!currentUser) {
        return NextResponse.json(
            {
                error: "Unauthorized: User must be logged in to add a dialect word.",
            },
            { status: 401 },
        );
    }

    const formData = Object.fromEntries((await req.formData()).entries());
    const fileParseResult = dialectWordApi.safeParse(formData);

    if (!fileParseResult.success) {
        return NextResponse.json(
            { error: "Ogiltig ljudfil: " + fileParseResult.error.message },
            { status: 400 },
        );
    }

    console.log(fileParseResult.data);

    return NextResponse.json({ message: "Word added successfully" });
}

export async function PUT(req: NextRequest) {
    const currentUser = await auth.api.getSession(req);

    if (!currentUser) {
        return NextResponse.json(
            {
                error: "Unauthorized: User must be logged in to update a dialect word.",
            },
            { status: 401 },
        );
    }

    const formData = await req.json();

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
        return NextResponse.json(
            { error: "Ogiltig data: id, dialectWord och nationalWord krävs." },
            { status: 400 },
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
            return NextResponse.json(
                {
                    error: "Kunde inte hitta nationalWordId för det angivna id:t.",
                },
                { status: 404 },
            );
        }
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Ett fel uppstod vid uppdatering av dialektordet.";
        return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
        message: "Word updated successfully",
        data: {
            dialectWord: updateWord.dialectWord,
            nationalWord: updateWord.nationalWord,
        },
    });
}
