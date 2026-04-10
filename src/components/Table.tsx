"use client";
import styles from "../app/page.module.css";
import { DialectWordTableResponse } from "@/types/DialektFormValidation/dialectWord";

type TableRow = DialectWordTableResponse & {
    soundFileUrl: string | null;
};

type TableProps = {
    tableData: TableRow[] | null; // Object containing pagination info and an array of objects with word, pronunciation, sound file URL, etc.
};

// The Table-component recives "tableData" as a prop from the parent component (e.g. the page).
// "tableData" is an object fetched from the API containing words, pronunciation, sound file, etc.
// Table renders a row for each object in "tableData.data".
export default function Table({ tableData }: TableProps) {
    const playSound = (url: string) => {
        const audio = new window.Audio(url);
        audio.play();
    };

    return (
        <>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.tableHeaderCell}>{"Dialekt"}</th>
                        <th className={styles.tableHeaderCell}>{"Ljudfil"}</th>
                        <th className={styles.tableHeaderCell}>{"Svenska"}</th>
                        <th className={styles.tableHeaderCell}>
                            {"Användare"}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through the data array and render a row for each object */}
                    {tableData?.map((item, rowIdx) => (
                        <tr key={rowIdx}>
                            <td className={styles.tableCell}>{item.word}</td>
                            <td className={styles.tableCell}>
                                {/* Show play button if a sound file exists */}
                                {item.soundFileUrl && (
                                    <button
                                        style={{
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                        }}
                                        type="button"
                                        aria-label="Spela upp ljud"
                                        onClick={() => {
                                            if (item.soundFileUrl) {
                                                playSound(item.soundFileUrl);
                                            }
                                        }}>
                                        ▶️
                                    </button>
                                )}
                            </td>
                            <td className={styles.tableCell}>
                                {item.nationalWord}
                            </td>
                            <td className={styles.tableCell}>
                                {item.userName}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
