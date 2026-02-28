"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SearchField2() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { push } = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (value: string) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Delay navigation to avoid excessive URL updates while typing
        timerRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("query", value);
            params.set("page", "1");

            push(`${pathname}?${params.toString()}`);
        }, 300);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        if (timerRef.current) {
            return clearTimeout(timerRef.current);
        }
    }, []);

    return (
        <div className={"searchFieldWrapper"}>
            <input
                className={"searchInput"}
                type="text"
                defaultValue={searchParams.get("query") || ""}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Sök..."
                autoComplete="off"
            />
        </div>
    );
}
