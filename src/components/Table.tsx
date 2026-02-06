import styles from "../app/page.module.css";

interface TableProps {
    headers: string[];
    data: any[];
}

export default function Table({ headers, data }: TableProps) {
    return (
        <>
            {/* Tabell headers */}
            {headers.map((header, idx) => (
                <div key={"header" + idx} className={styles.tableHeaderCell}>
                    {header}
                </div>
            ))}

            {/* Dialekt tabellrader */}
            {/* "item" är Datan och "rowIdx" är radens index */}
            {data.map((item, rowIdx) => [
                <div key={`ord${rowIdx}`} className={styles.tableCell}>
                    {item.word}
                </div>,
                <div key={`ljudfil${rowIdx}`} className={styles.tableCell}>
                    {item.soundFileId}
                </div>,
                <div key={`uttal${rowIdx}`} className={styles.tableCell}>
                    {item.pronunciation}
                </div>,
                <div key={`anvandare${rowIdx}`} className={styles.tableCell}>
                    {item.userId}
                </div>,
                <div key={`svenska${rowIdx}`} className={styles.tableCell}>
                    {item.nationalWordId}
                </div>,
            ])}
        </>
    );
}
