import styles from "../page.module.css";
import Pagination from "../../components/Pagination";
import AdminTable from "@/components/Admin/AdminTable";
import SearchField from "@/components/Searchfield";
import Link from "next/link";
import { GetAllDialectwords } from "@/actions/dialectwords";
import { getActiveUserSession } from "@/lib/auth";

type Params = {
    searchParams: Promise<{
        query: string;
        page: string;
    }>;
};

export default async function AdminView({ searchParams }: Params) {
    await getActiveUserSession();

    const { query = "", page = "1" } = await searchParams;
    const res = await GetAllDialectwords({
        query,
        page: +page,
        pageSize: 10,
    });
    const totalPages = Math.ceil(res.totalResults / 10);

    return (
        <main>
            <div className={styles.tableContainerWrapper}>
                <div>
                    <div className={styles.tableContainer}>
                        <SearchField />
                        <div className={styles.tableHeader}>
                            <h2>Ordlista</h2>
                            <div>
                                <Link href="/" className="btn primary">
                                    Till startsidan
                                </Link>
                                <Link href="/addWord" className="btn primary">
                                    Lägg till ord
                                </Link>
                            </div>
                        </div>
                        <AdminTable tableData={res.rawData} />
                    </div>
                    <Pagination page={+page} totalPages={totalPages} />
                </div>
            </div>
        </main>
    );
}
