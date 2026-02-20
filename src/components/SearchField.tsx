import { useState, useRef } from "react";

export function SearchField() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleSearchWithDebounce(value: string) {
        setQuery(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (value.length < 2) {
            setResults([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        timeoutRef.current = setTimeout(async () => {
            try {
                console.log("Fetching:", `/api/searchDialectWords?query=${encodeURIComponent(value)}`);
                
                const res = await fetch(
                    `/api/searchDialectWords?query=${encodeURIComponent(value)}`
                );

                console.log("Response status:", res.status);
                console.log("Response headers:", Object.fromEntries(res.headers.entries()));

                // Läs svaret som text först för att se vad det är
                const text = await res.text();
                console.log("Response body (first 500 chars):", text.substring(0, 500));

                // Kontrollera om det är HTML (DOCTYPE indikerar HTML)
                if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
                    console.error("Got HTML instead of JSON!");
                    throw new Error("API-rutten returnerade HTML istället för JSON. Kontrollera att /api/searchDialectWords/route.ts finns.");
                }

                // Försök parsa som JSON
                const data = JSON.parse(text);
                console.log("Parsed data:", data);

                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Sökfel:", error);
                setError(error instanceof Error ? error.message : "Något gick fel");
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
                placeholder="Sök dialektord..."
            />

            {isLoading && <p>Söker...</p>}
            {error && <p style={{ color: "red" }}>Fel: {error}</p>}

            {results.length > 0 && (
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
            )}
            
            {!isLoading && query.length >= 2 && results.length === 0 && !error && (
                <p>Inga resultat hittades</p>
            )}
        </div>
    );
}