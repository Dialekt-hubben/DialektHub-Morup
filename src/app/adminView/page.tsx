import styles from "../page.module.css";
import Pagination from "../../components/Pagination";
import AdminTable from "@/components/Admin/AdminTable";
import AdminUserRoles from "@/components/Admin/AdminUserRoles";
import SearchField from "@/components/Searchfield";
import ImportExcelSection from "@/components/Admin/ImportExcelSection";
import Link from "next/link";
import { GetAllDialectwords } from "@/actions/dialectwords";
import { getAdminSession } from "@/lib/auth";
import { generateS3Urls } from "@/actions/soundfileUrl";

type Params = {
    searchParams: Promise<{
        query: string;
        page: string;
    }>;
};

export default async function AdminView({ searchParams }: Params) {
    await getAdminSession();

    const { query = "", page = "1" } = await searchParams;
    const res = await GetAllDialectwords({
        query,
        page: +page,
        pageSize: 10,
    });
    const totalPages = Math.ceil(res.totalResults / 10);

    // Generera URL:er bara för de ljudfiler som visas på den här sidan.
    const filenames = res.rawData
            .map((item) => item.fileName)
            .filter((fileName): fileName is string => Boolean(fileName));
        const soundFileUrls = await generateS3Urls(filenames);
    
        // loopa igenom res.data och lägg till soundFileUrl för varje objekt som har en fileName
        const tableDataWithUrls = res.rawData
            // .filter((item) => item.fileName) // Filtrera bara de objekt som har en fileName
            .map((item) => ({
                ...item,
                soundFileUrl: soundFileUrls[item.fileName as string] || null, // Lägg till soundFileUrl baserat på fileName
            }));

    return (
        <main>
            <div className={styles.tableContainerWrapper}>
                <div>
                    <div className={styles.tableContainer}>
                        <SearchField />
                        <Pagination page={+page} totalPages={totalPages} />
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
                        <AdminTable tableData={tableDataWithUrls} />
                    </div>
                    <Pagination page={+page} totalPages={totalPages} />
                </div>
            </div>
        </main>
    );
}
