import styles from "../app/page.module.css";

interface TableProps {
    data: any[];
}

// The Table-component recives "data" as a prop from the parent component (e.g. the page).
// "data" is an array of objects fetched from the API containing words, pronunciation, sound file, etc.
// Table renders a row for each object in "data".
export default function Table({ data }: TableProps) {

const playSound = (url: string) => {
    const audio = new window.Audio(url);
    audio.play();
};

return (
    <>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.tableHeaderCell}>{"Ord"}</th>
                    <th className={styles.tableHeaderCell}>{"Ljudfil"}</th>
                    <th className={styles.tableHeaderCell}>{"Uttal"}</th>
                    <th className={styles.tableHeaderCell}>{"Svenska"}</th>
                    <th className={styles.tableHeaderCell}>{"Användare"}</th>
                </tr>
            </thead>
            <tbody>
                {/* Loop through the data array and render a row for each object */}
                {data.map((item, rowIdx) => (
                    <tr key={rowIdx}>
                        <td className={styles.tableCell}>{item.word}</td>
                        <td className={styles.tableCell}>
                            {/* Show play button if soundFileUrl exists, if it does not exist show nothing */}
                            {item.soundFileUrl && (
                                <button
                                    style={{ border: "none", fontSize: "20px", cursor: "pointer" }}
                                    type="button"
                                    aria-label="Spela upp ljud"
                                    onClick={() => playSound(item.soundFileUrl)}
                                >
                                    ▶️
                                </button>
                            )}
                        </td>
                        <td className={styles.tableCell}>{item.pronunciation}</td>
                        <td className={styles.tableCell}>{item.nationalWord}</td>
                        <td className={styles.tableCell}>{item.userName}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);
}