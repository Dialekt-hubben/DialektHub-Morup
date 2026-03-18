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

    const safeTotalPages = Math.max(1, totalPages); // Ensure totalPages is at least 1 to avoid issues with pagination logic
    const currentPage = Math.min(Math.max(page, 1), safeTotalPages); // Ensure current page is between 1 and totalPages
    const maxVisiblePageButtons = 10;

    // Calculate the range of pagenumbers to display based on the current page untill the max visible page buttons.
    const paginationGroupStart =
        Math.floor((currentPage - 1) / maxVisiblePageButtons) *
            maxVisiblePageButtons +
        1;
    const paginationGroupEnd = Math.min(
        safeTotalPages,
        paginationGroupStart + maxVisiblePageButtons - 1,
    );

    // Create an array of page numbers to display in the pagination based on the calculated start and end of the pagination group.
    const currentGroupPages = Array.from(
        {
            length: paginationGroupEnd - paginationGroupStart + 1,
        },
        (_, i) => paginationGroupStart + i,
    );

    const nextPage = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(Math.min(safeTotalPages, currentPage + 1)));
        push(`${pathname}?${params.toString()}`);
    };

    const prevPage = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(Math.max(1, currentPage - 1)));
        push(`${pathname}?${params.toString()}`);
    };

    const setPage = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(
            "page",
            String(Math.min(safeTotalPages, Math.max(1, pageNumber))),
        );
        push(`${pathname}?${params.toString()}`);
    };

    const prevPageGroup = () => {
        setPage(paginationGroupStart - maxVisiblePageButtons);
    };

    const nextPageGroup = () => {
        setPage(paginationGroupStart + maxVisiblePageButtons);
    };

    return (
        <div className={styles.paginationContainer}>
            {/* Knapp för föregående sida */}
            <button
                className={styles.paginationButton}
                onClick={prevPage}
                disabled={currentPage === 1}>
                Föregående
            </button>

            {/* Knapp för att hoppa tillbaka 10 sidor */}
            <button
                className={styles.paginationButton}
                onClick={prevPageGroup}
                disabled={paginationGroupStart === 1}>
                -10
            </button>

            {/* Skapar max 10 sidknappar åt gången */}
            {currentGroupPages.map((pageNumber) => {
                return (
                    <button
                        key={pageNumber}
                        className={
                            currentPage === pageNumber
                                ? styles.paginationButtonActive
                                : styles.paginationButton
                        }
                        onClick={() => setPage(pageNumber)}>
                        {pageNumber}
                    </button>
                );
            })}

            {/* Knapp för att hoppa fram 10 sidor */}
            <button
                className={styles.paginationButton}
                onClick={nextPageGroup}
                disabled={paginationGroupEnd === safeTotalPages}>
                +10
            </button>

            {/* Knapp för nästa sida */}
            <button
                className={styles.paginationButton}
                onClick={nextPage}
                disabled={currentPage === safeTotalPages}>
                Nästa
            </button>
        </div>
    );
}

export default Pagination;
