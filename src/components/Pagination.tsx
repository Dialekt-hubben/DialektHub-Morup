import styles from "../app/page.module.css";

interface PaginationProps {
    page: number; // Aktuell sida
    totalPages: number; // Totalt antal sidor
    setPage: (page: number) => void; // Funktion för att uppdatera aktuell sida
}

// Pagination Component
const Pagination = ({ page, totalPages, setPage }: PaginationProps) => (
    <div className={styles.paginationContainer}>
        {/* Knapp för föregående sida */}
        <button
            className={styles.paginationButton}
            onClick={() => setPage(Math.max(1, page - 1))}
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
                    {" "}
                    {i + 1}
                </button>
            );
        })}

        {/* Knapp för nästa sida */}
        <button
            className={styles.paginationButton}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}>
            Nästa
        </button>
    </div>
);

export default Pagination;
