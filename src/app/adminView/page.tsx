"use client";
import AddWordForm from "@/components/AddWordForm";
import { useState, useEffect } from "react";
import style from "./adminView.module.css";
import UpdateWordSection from "@/components/Admin/UpdateWordSection";
import ImportExcelSection from "@/components/Admin/ImportExcelSection";
import { useSearchParams } from "next/navigation";

type SearchWordResult = {
    id: number;
    word: string;
    nationalWord: string | null;
};

function AdminView() {
    const [results, setResults] = useState<SearchWordResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";

    // useEffect(() => {
    //     if (!query || query.length < 2) {
    //         setResults([]);
    //         setSearchError("");
    //         return;
    //     }
    //     setLoading(true);
    //     setSearchError("");
    //     fetch(`/api/searchDialectWords?query=${encodeURIComponent(query)}`)
    //         .then((res) => {
    //             if (!res.ok) {
    //                 throw new Error("Kunde inte hämta sökresultat.");
    //             }
    //             return res.json();
    //         })
    //         .then((data: SearchWordResult[]) => setResults(data))
    //         .catch(() => {
    //             setResults([]);
    //             setSearchError("Kunde inte hämta sökresultat.");
    //         })
    //         .finally(() => setLoading(false));
    // }, [query]);

    return (
        <div>
            <h1 className={style.adminContainerH1}>Administrations Panel</h1>
            <div className={style.adminContainer}>
                <div>
                    <AddWordForm />
                </div>
                <div>
                    <UpdateWordSection
                        loading={loading}
                        results={results}
                        query={query}
                        searchError={searchError}
                    />
                </div>
                <div>
                    <ImportExcelSection />
                </div>
            </div>
        </div>
    );
}

export default AdminView;
