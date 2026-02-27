"use client";

import styles from "../app/page.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface PaginationProps {
    page: number; // Current page number
    totalPages: number; // Total number of pages
}

function Pagination({ page, totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { push } = useRouter();

    const nextPage = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(Math.min(totalPages, page + 1)));

        push(`${pathname}?${params.toString()}`);
    };

    const prevPage = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(Math.max(1, page - 1)));

        push(`${pathname}?${params.toString()}`);
    };
    return (
        <div className={styles.paginationContainer}>
            {/* Knapp för föregående sida */}
            <button
                className={styles.paginationButton}
                onClick={prevPage}
                disabled={page === 1}>
                Föregående
            </button>

            {/* Skapar en knapp för varje sida */}
            {Array.from({ length: totalPages }, (_, i) => {
                return (
                    <button
                        key={i + 1}
                        className={
                            page === i + 1
                                ? styles.paginationButtonActive
                                : styles.paginationButton
                        }
                        onClick={() => setPage(i + 1)}>
                        {i + 1}
                    </button>
                );
            })}

            {/* Knapp för nästa sida */}
            <button
                className={styles.paginationButton}
                onClick={nextPage}
                disabled={page === totalPages}>
                Nästa
            </button>
        </div>
    );
}

export default Pagination;
