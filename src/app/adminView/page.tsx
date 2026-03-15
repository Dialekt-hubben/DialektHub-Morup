"use client";
import AddWordForm from "@/components/AddWordForm";
import { useState, useEffect } from "react";
import style from "./adminView.module.css";
import UpdateWordSection from "@/components/Admin/UpdateWordSection";
import ImportExcelSection from "@/components/Admin/ImportExcelSection";
import { useSearchParams } from "next/navigation";

function AdminView() {
    // Todo: Implement search functionality for updating words. 
    // Probably use GetAllDialectwords and make this a server components 

    // const [results, setResults] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const searchParams = useSearchParams();
    // const query = searchParams.get("query") || "";

    // useEffect(() => {
    //     if (!query || query.length < 2) {
    //         setResults([]);
    //         return;
    //     }
    //     setLoading(true);
    //     fetch(`/api/searchDialectWords?query=${encodeURIComponent(query)}`)
    //         .then((res) => res.json())
    //         .then((data) => setResults(data))
    //         .catch(() => setResults([]))
    //         .finally(() => setLoading(false));
    // }, [query]);

    return (
        <div>
            <h1 className={style.adminContainerH1}>Administrations Panel</h1>
            <div className={style.adminContainer}>
                <div>
                    <AddWordForm />
                </div>
                {/* <div>
                    <UpdateWordSection
                        loading={loading}
                        results={results}
                        query={query}
                    />
                </div> */}
                <div>
                    <ImportExcelSection />
                </div>
            </div>
        </div>
    );
}

export default AdminView;
