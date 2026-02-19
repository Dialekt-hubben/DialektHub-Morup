import { useState, useRef } from "react";
import { NextRequest, NextResponse } from "next/server";
import { searchDialectWords } from "@/Drizzle/searchDialectWords";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    try {
        const results = await searchDialectWords(query);
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: "Server fel" }, { status: 500 });
    }
}

export function SearchField() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleSearchWithDebounce(value: string) {
        setQuery(value);

        // Rensa föregående timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Om sökningen är för kort, rensa resultat
        if (value.length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        // Visa laddningsindikator direkt
        setIsLoading(true);

        // Sätt nytt timeout
        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/searchDialectWords?query=${encodeURIComponent(value)}`,
                );
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Sökfel:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }

    return (
        <div className="searchField">
            <input
                className="searchInput"
                type="text"
                value={query}
                onChange={(e) => handleSearchWithDebounce(e.target.value)}
                placeholder="Sök"
            />

            {isLoading && <p>Söker...</p>}

            <ul className="searchResults">
                {results.map((result) => (
                    <li key={result.id} className="wordListItem">
                        <div className="word">{result.word}</div>
                        <div className="nationalWord">
                            {result.nationalWord}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
