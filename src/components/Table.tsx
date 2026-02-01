import styles from "../app/page.module.css";

interface TableProps {
    data: any[];
}


export default function Table({ data }: TableProps) {
    return (
    <>
    <table className={styles.table}>
        <thead>
            <tr>
                <th className={styles.tableHeaderCell}>{"Ord"}</th>
                <th className={styles.tableHeaderCell}>{"Ljudfil"}</th>
                <th className={styles.tableHeaderCell}>{"Uttal"}</th>
                <th className={styles.tableHeaderCell}>{"Användare"}</th>
                <th className={styles.tableHeaderCell}>{"Svenska"}</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item, rowIdx) => (
                <tr key={rowIdx}>
                    <td className={styles.tableCell}>{item.word}</td>
                    <td className={styles.tableCell}>{item.soundFileId}</td>
                    <td className={styles.tableCell}>{item.pronunciation}</td>
                    <td className={styles.tableCell}>{item.userId}</td>
                    <td className={styles.tableCell}>{item.nationalWordId}</td>
                </tr>
            ))}
        </tbody>
    </table>
    </>
    );
}