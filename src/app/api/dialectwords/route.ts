import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dialectWordApi } from "@/types/DialektFormValidation/dialectWordApiSchema";

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
