import { NextRequest, NextResponse } from "next/server";
import { searchDialectWords } from "@/Drizzle/searchDialectWords";

export async function GET(request: NextRequest) {
    console.log("=== API ROUTE CALLED ===");
    
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("query");
        
        console.log("Query received:", query);

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const results = await searchDialectWords(query);
        console.log("Results count:", results.length);
        
        return NextResponse.json(results);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Search failed" }, 
            { status: 500 }
        );
    }
}
