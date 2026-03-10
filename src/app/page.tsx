import styles from "./page.module.css";
import Pagination from "../components/Pagination";
import Table from "@/components/Table";
import SearchField from "@/components/Searchfield";
import Link from "next/link";
import { GetAllDialectwords } from "@/actions/dialectwords";

type params = {
    searchParams: Promise<{
        query: string;
        page: string;
    }>;
};

export default async function Home({ searchParams }: params) {
    const { query = "", page = "1" } = await searchParams;

    const res = await GetAllDialectwords({
        query,
        page: +page,
        pageSize: 10,
    });
    const totalPages = Math.ceil(res.totalResults / 10); // 10 is the pageSize

    return (
        <main>
            <div className={styles.tableContainerWrapper}>
                <div>
                    <div className={styles.tableContainer}>
                        <SearchField />
                        <div className={styles.tableHeader}>
                            <h2>Ordlista</h2>
                            <Link href="/addWord" className="btn primary">
                                Lägg till ord
                            </Link>
                        </div>
                        <Table tableData={res.rawData} />
                    </div>
                    <Pagination page={+page} totalPages={totalPages} />
                </div>
            </div>
        </main>
    );
}
