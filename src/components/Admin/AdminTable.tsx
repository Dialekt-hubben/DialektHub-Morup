"use client";

import { useEffect, useState } from "react";
import pageStyles from "@/app/page.module.css";
import styles from "./AdminTable.module.css";
import { DialectWordTableResponse } from "@/types/DialektFormValidation/dialectWord";
import { UpdateDialectword } from "@/actions/dialectwords";

type AdminTableProps = {
    tableData: DialectWordTableResponse[] | null;
};

export default function AdminTable({ tableData }: AdminTableProps) {
    const [rows, setRows] = useState<DialectWordTableResponse[]>(
        tableData ?? [],
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [wordValue, setWordValue] = useState("");
    const [nationalWordValue, setNationalWordValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [savedRowId, setSavedRowId] = useState<number | null>(null);

    useEffect(() => {
        setRows(tableData ?? []);
    }, [tableData]);

    useEffect(() => {
        if (savedRowId === null) {
            return;
        }

        // När en rad har sparats, visa "Sparat" i 2.5 sekunder innan det försvinner
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
        setWordValue(item.word);
        setNationalWordValue(item.nationalWord ?? "");
        setError("");
        setSavedRowId(null);
    };

    // Avbryter redigering och återställer alla tillstånd
    const cancelEdit = () => {
        setEditingId(null);
        setWordValue("");
        setNationalWordValue("");
        setError("");
    };

    const saveEdit = async () => {
        if (editingId === null) {
            return;
        }

        // Förbered data för uppdatering, trimma whitespace och validera att fälten inte är tomma
        const targetId = editingId;
        const targetWord = wordValue.trim();
        const targetNationalWord = nationalWordValue.trim();

        if (!targetWord || !targetNationalWord) {
            setError("Både dialektord och svenskt ord måste fyllas i.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            await UpdateDialectword({
                id: targetId,
                word: targetWord,
                nationalWord: targetNationalWord,
            });

            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === targetId
                        ? {
                              ...row,
                              word: targetWord,
                              nationalWord: targetNationalWord,
                          }
                        : row,
                ),
            );
            setSavedRowId(targetId);
            cancelEdit();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Ett fel uppstod vid uppdatering.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
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
                        <tr>
                            <td className={pageStyles.tableCell}>
                                {item.word}
                            </td>
                            <td className={pageStyles.tableCell}>
                                {item.soundFileUrl && (
                                    <button
                                        style={{
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                        }}
                                        type="button"
                                        aria-label="Spela upp ljud"
                                        onClick={() =>
                                            playSound(item.soundFileUrl || ":)")
                                        }>
                                        ▶️
                                    </button>
                                )}
                            </td>
                            <td className={pageStyles.tableCell}>
                                {item.nationalWord}
                            </td>
                            <td className={pageStyles.tableCell}>
                                {item.userName}
                            </td>
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
                                        <span className={styles.savedText}>
                                            Sparat
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                        {editingId === item.id && (
                            <tr>
                                <td colSpan={6} className={styles.editRowCell}>
                                    <div className={styles.editForm}>
                                        <label className={styles.inputGroup}>
                                            <span>Dialektord</span>
                                            <input
                                                type="text"
                                                value={wordValue}
                                                onChange={(event) =>
                                                    setWordValue(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={isSaving}
                                            />
                                        </label>

                                        <label className={styles.inputGroup}>
                                            <span>Svensktord</span>
                                            <input
                                                type="text"
                                                value={nationalWordValue}
                                                onChange={(event) =>
                                                    setNationalWordValue(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={isSaving}
                                            />
                                        </label>

                                        <div className={styles.editActions}>
                                            <button
                                                type="button"
                                                className="btn primary"
                                                onClick={saveEdit}
                                                disabled={isSaving}>
                                                {isSaving
                                                    ? "Sparar..."
                                                    : "Spara"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={cancelEdit}
                                                disabled={isSaving}>
                                                Avbryt
                                            </button>
                                        </div>
                                    </div>
                                    {error && (
                                        <p className={styles.errorText}>
                                            {error}
                                        </p>
                                    )}
                                </td>
                            </tr>
                        )}
                    </>
                ))}
            </tbody>
        </table>
    );
}
