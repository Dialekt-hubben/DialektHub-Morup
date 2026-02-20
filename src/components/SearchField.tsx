import { useState, useRef } from "react";
import "./searchField.css";

type SearchFieldProps = {
    onSelect: (word: any | null) => void;
};

export function SearchField({ onSelect }: SearchFieldProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDropDown, setShowDropdown] = useState(false);
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
            setShowDropdown(false); // Hide dropdown when query is too short
            onSelect(null); // show all words when query is cleared
            return;
        }

        setIsLoading(true);
        setError(null);

        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/searchDialectWords?query=${encodeURIComponent(value)}`,
                );

                const text = await res.text();

                const data = JSON.parse(text);
                console.log("Parsed data:", data);

                setResults(Array.isArray(data) ? data : []);
                setShowDropdown(true); // Show dropdown when results are available
            } catch (error) {
                console.error("Sökfel:", error);
                setError(
                    error instanceof Error ? error.message : "Något gick fel",
                );
                setResults([]);
                setShowDropdown(false); // Hide dropdown on error
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }

    function handleSelect(result: any) {
        setQuery(result.word);
        setShowDropdown(false);
        setResults([]); // Clear results after selection
        onSelect(result);
    }

    return (
        <div className={"searchFieldWrapper"}>
            <input
                className={"searchInput"}
                type="text"
                value={query}
                onChange={(e) => handleSearchWithDebounce(e.target.value)}
                placeholder="Sök..."
                autoComplete="off"
                onFocus={() => results.length > 0 && setShowDropdown(true)}
            />

            {isLoading && <div className={"searchLoading"}>Söker...</div>}
            {error && <div className={"searchError"}>Fel: {error}</div>}

            {showDropDown && results.length > 0 && (
                <ul className={"searchDropdown"}>
                    {results.map((result) => (
                        <li
                            key={result.id}
                            className={"searchDropdownItem"}
                            onClick={() => handleSelect(result)}>
                            <span className={"word"}>{result.word}</span>
                            <span className={"nationalWord"}>
                                {result.nationalWord}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading &&
                query.length >= 2 &&
                results.length === 0 &&
                !error && (
                    <p className={"searchNoResults"}>Inga resultat hittades</p>
                )}
        </div>
    );
}
