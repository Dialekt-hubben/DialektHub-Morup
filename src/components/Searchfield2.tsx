"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function SearchField2() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { push } = useRouter();

    function handleSearch(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("query", value);
        params.set("page", "1");

        push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className={"searchFieldWrapper"}>
            <input
                className={"searchInput"}
                type="text"
                value={searchParams.get("query") || ""}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Sök..."
                autoComplete="off"
            />
        </div>
    );
}
