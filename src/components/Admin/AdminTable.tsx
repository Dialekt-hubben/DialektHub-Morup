"use client";

import { useEffect, useState } from "react";
import pageStyles from "@/app/page.module.css";
import styles from "./AdminTable.module.css";
import { DialectWordTableResponse } from "@/types/DialektFormValidation/dialectWord";
import EditWordForm, { EditWordFormUpdatedData } from "./EditWordForm";

type AdminTableProps = {
    tableData: DialectWordTableResponse[] | null;
};

export default function AdminTable({ tableData }: AdminTableProps) {
    const [rows, setRows] = useState<DialectWordTableResponse[]>( tableData ?? [], );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savedRowId, setSavedRowId] = useState<number | null>(null);

    // Uppdatera "rows" varje gång "tableData" ändras.
    useEffect(() => {
        setRows(tableData ?? []);
    }, [tableData]);

    // När en rad har sparats, visa "Sparat" i 2.5 sekunder innan det försvinner
    useEffect(() => {
        if (savedRowId === null) {
            return;
        }

        const timerId = setTimeout(() => {
            setSavedRowId(null);
        }, 2500);
        return () => clearTimeout(timerId);
    }, [savedRowId]);

    // Funktion för att spela upp ljudfilen
    const playSound = (url: string) => {
        const audio = new window.Audio(url);
        audio.play();
    };

    // Hanterar start av redigering av en rad, lägg till fler fält här om du vill redigera mer än orden
    const startEdit = (item: DialectWordTableResponse) => {
        setEditingId(item.id);
        setSavedRowId(null);
    };

    // Avbryter redigering och återställer alla tillstånd
    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleUpdated = (updated: EditWordFormUpdatedData) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === updated.id
                    ? {
                          ...row,
                          word: updated.dialectWord,
                          nationalWord: updated.nationalWord,
                      }
                    : row,
            ),
        );
        setSavedRowId(updated.id);
    };

    return (
        <table className={`${pageStyles.table} ${styles.adminTable}`}>
            <thead>
                <tr>
                    <th className={pageStyles.tableHeaderCell}>{"Dialekt"}</th>
                    <th className={pageStyles.tableHeaderCell}>{"Ljudfil"}</th>
                    <th className={pageStyles.tableHeaderCell}>{"Svenska"}</th>
                    <th className={pageStyles.tableHeaderCell}>
                        {"Användare"}
                    </th>
                    <th className={pageStyles.tableHeaderCell}>
                        {"Hantering"}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((item) => (
                    <>
                        <tr key={item.id}>
                            <td className={pageStyles.tableCell}>{item.word}</td>
                            <td className={pageStyles.tableCell}>
                                {item.fileName && item.soundFileUrl && (
                                    <button
                                        style={{
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                        }}
                                        type="button"
                                        aria-label="Spela upp ljud"
                                        onClick={() => playSound(item.soundFileUrl!)}>
                                        ▶️
                                    </button>
                                )}
                            </td>
                            <td className={pageStyles.tableCell}>{item.nationalWord}</td>
                            <td className={pageStyles.tableCell}>{item.userName}</td>
                            <td
                                className={`${pageStyles.tableCell} ${styles.adminActionCell}`}>
                                <div className={styles.actionWrapper}>
                                    <button
                                        type="button"
                                        className="btn primary"
                                        onClick={() => startEdit(item)}>
                                        Edit
                                    </button>
                                    {savedRowId === item.id && (
                                        <span className={styles.savedText}>Sparat</span>
                                    )}
                                </div>
                            </td>
                        </tr>

                        {editingId === item.id && (
                            <tr>
                                <td className={styles.editRowCell} colSpan={5}>
                                    <EditWordForm
                                        id={item.id}
                                        dialectWord={item.word}
                                        nationalWord={item.nationalWord ?? ""}
                                        onClose={cancelEdit}
                                        onUpdated={handleUpdated}
                                    />
                                </td>
                            </tr>
                        )}
                    </>
                ))}
            </tbody>
        </table>
    );
}
