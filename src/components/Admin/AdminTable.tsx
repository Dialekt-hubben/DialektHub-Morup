"use client";

import { Fragment, useEffect, useState } from "react";
import styles from "./AdminTable.module.css";
import {
    DialectWordTableResponse,
    updateDialectWord,
} from "@/types/DialektFormValidation/dialectWord";
// import EditWordForm, { EditWordFormUpdatedData } from "./EditWordForm";
import { Status } from "@/types/status";
import { UpdateDialectWordStatus } from "@/actions/dialectwords";
import SoundButton from "../SoundButton";
import EditWordForm from "./EditWordForm";
import Link from "next/link";
import { Table, TableCell, TableRow } from "../Table";

type AdminTableProps = {
    tableData: DialectWordTableResponse[] | null;
};

export default function AdminTable({ tableData }: AdminTableProps) {
    const [rows, setRows] = useState<DialectWordTableResponse[]>(tableData ?? []);
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

    // Hanterar start av redigering av en rad, lägg till fler fält här om du vill redigera mer än orden
    const startEdit = (item: DialectWordTableResponse) => {
        setEditingId(item.id);
        setSavedRowId(null);
    };

    // Avbryter redigering och återställer alla tillstånd
    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleUpdated = (updated: updateDialectWord) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === updated.id
                    ? {
                          ...row,
                          word: updated.dialectWord,
                          nationalWord: updated.nationalWord,
                          fileName: updated.audioFile
                              ? updated.audioFile.name
                              : row.fileName,
                          soundFileUrl: updated.audioFile
                              ? URL.createObjectURL(updated.audioFile)
                              : row.soundFileUrl,
                      }
                    : row,
            ),
        );
        setSavedRowId(updated.id);
    };

    const handleStatusChange = async (id: number, isPublished: Status) => {
        console.log({ id, isPublished });

        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === id ? { ...row, status: isPublished } : row,
            ),
        );
        await UpdateDialectWordStatus(id, isPublished);
    };

    return (
        <Table
            title="Ordlista"
            actions={
                <>
                    <Link href="/" className="btn primary">
                        Till startsidan
                    </Link>
                    <Link href="/addWord" className="btn primary">
                        Lägg till ord
                    </Link>
                </>
            }
            headerColumns={[
                "Dialekt",
                "Ljudfil",
                "Svenska",
                "Användare",
                "Publicerad",
                "Hantering",
            ]}>
            {rows.map((item) => (
                <Fragment key={item.id}>
                    <TableRow>
                        <TableCell>{item.word}</TableCell>
                        <TableCell>
                            {item.fileName && item.soundFileUrl && (
                                <SoundButton url={item.soundFileUrl} />
                            )}
                        </TableCell>
                        <TableCell>{item.nationalWord}</TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>
                            <select
                                value={item.status}
                                onChange={(changeEvent) =>
                                    handleStatusChange(
                                        item.id,
                                        changeEvent.target.value as Status,
                                    )
                                }>
                                <option value={Status.enum.approved}>Publicera</option>
                                <option value={Status.enum.pending}>Ej publicerad</option>
                                <option value={Status.enum.rejected}>Neka</option>
                            </select>
                        </TableCell>
                        <TableCell className={styles.adminActionCell}>
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
                        </TableCell>
                    </TableRow>

                    {editingId === item.id && (
                        <TableRow>
                            <TableCell className={styles.editRowCell} colSpan={6}>
                                <EditWordForm
                                    id={item.id}
                                    dialectWord={item.word}
                                    nationalWord={item.nationalWord ?? ""}
                                    currentAudioFileName={item.fileName ?? null}
                                    onClose={cancelEdit}
                                    onUpdated={handleUpdated}
                                />
                            </TableCell>
                        </TableRow>
                    )}
                </Fragment>
            ))}
        </Table>
    );
}
