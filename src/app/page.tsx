import styles from "./page.module.css";
import Pagination from "../components/Pagination";
import Table from "@/components/Table";
import { DialectWordTableResponse } from "@/types/dialectword";
import SearchField2 from "@/components/Searchfield2";
import Link from "next/link";

type params = {
    searchParams: Promise<{
        query: string;
        page: string;
    }>;
};

export default async function Home({ searchParams }: params) {
    const { query = "", page = "" } = await searchParams;
    const PAGE_SIZE = 10; // Antal poster per sida
    const res = await fetch(
        `/api/dialectwords?page=${page}&pageSize=${PAGE_SIZE}&query=${query}`,
    );
    const result = DialectWordTableResponse.safeParse(await res.json()); //parantesen dyker upp pga prettier

    if (!result.success) {
        console.error("Failed to fetch data:", result.error);
        return <div>Failed to load data</div>;
    }

    const totalPages = Math.ceil(result.data.total / PAGE_SIZE);

    return (
        <main>
            <div className={styles.tableContainerWrapper}>
                <div>
                    <div className={styles.tableContainer}>
                        <SearchField2 />
                        <div className={styles.tableHeader}>
                            <h2>Ordlista</h2>
                            <Link href="/addWord" className="btn primary">
                                Lägg till ord
                            </Link>
                        </div>
                        <Table tableData={result.data} />
                    </div>
                    <Pagination page={+page} totalPages={totalPages} />
                </div>
            </div>
        </main>
    );
}
