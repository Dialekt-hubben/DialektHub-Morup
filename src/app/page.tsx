"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Pagination from "../components/Pagination";
import Table from "@/components/Table";
import { DialectWordTableResponse } from "@/types/dialectword";
import { SearchField } from "@/components/SearchField";

const headers = ["Ord", "Ljudfil", "Uttal", "Användare", "Svenska"];

const PAGE_SIZE = 10; // Antal poster per sida

export default function Home() {
    const [data, setData] = useState<DialectWordTableResponse | null>(null); // Data för den aktuella sidan
    const [total, setTotal] = useState(0); // Totalt antal poster, används för att beräkna totala sidor
    const [page, setPage] = useState(1); // börjar på sida 1
    const [filteredWord, setFilteredWord] = useState<any[] | null>(null); // Det valda ordet från sökfältet
    const totalPages = Math.ceil(total / PAGE_SIZE);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                `/api/dialectwords?page=${page}&pageSize=${PAGE_SIZE}`,
            );
            const result = (await res.json()) as DialectWordTableResponse; //parantesen dyker upp pga prettier
            setData(result || null);
            setTotal(result?.total || 0);
        }
        fetchData();
    }, [page]);

    // Om ett ord är valt, visa bara det i tabellen
    const otherData = filteredWord
        ? { data: filteredWord, total: filteredWord.length }
        : data || null;

    return (
        <main>
            <div className={styles.tableContainerWrapper}>
                <div>
                    <div className={styles.tableContainer}>
                        <SearchField onSelect={setFilteredWord} />
                        <h2 className={styles.tableHeader}>Ordlista</h2>
                        <Table tableData={otherData} />
                    </div>
                    {!filteredWord && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
