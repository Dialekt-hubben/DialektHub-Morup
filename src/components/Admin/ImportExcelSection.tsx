"use client";

import React, { useEffect, useRef, useState } from "react";
import style from "@/components/Admin/ImportExcelSection.module.css";
import { importExcelRows } from "@/actions/importExcelToDb";
import type { ExcelWordRow } from "@/actions/importExcelToDb";
import * as XLSX from "xlsx";

const EXCEL_IMPORT_IN_PROGRESS = "excelImportInProgress";

// Parses uploaded Excel rows and splits them into importable and skipped entries.
type ExcelRow = string[];
type ValidRow = {
    skip: false;
    dialectWord: string;
    nationalWord: string;
};
type InvalidRow = {
    skip: true;
    reason: string;
    dialectWord: string;
    nationalWord: string;
};

// Function to determine if a row from the Excel file should be imported or skipped based on its content.
function shouldSkipRow(row: ExcelRow): ValidRow | InvalidRow {
    const dialectWord = row[0]?.toString?.().trim?.() ?? "";
    const nationalWord = row[1]?.toString?.().trim?.() ?? "";

    if (!dialectWord || !nationalWord) {
        return {
            skip: true,
            reason: "Tomma värden",
            dialectWord,
            nationalWord,
        };
    }
    return {
        skip: false,
        dialectWord,
        nationalWord,
    };
}

// Main function for the ImportExcelSection component, which handles the file input and import process.
const ImportExcelSection = () => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [importLock, setimportLock] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const isImportInProgress =
            sessionStorage.getItem(EXCEL_IMPORT_IN_PROGRESS) === "true";
        if (isImportInProgress) {
            setimportLock(true);
            setMessage("Import pågår...");
            return;
        }
    }, []);

    // Handles the import process when the user clicks the import button,
    const handleImport = async () => {
        const file = fileInput.current?.files?.[0];
        
        if (!file) {
            setMessage("Välj en fil först.");
            return;
        }

        setimportLock(true);
        setMessage("Import pågår...");
        sessionStorage.setItem(EXCEL_IMPORT_IN_PROGRESS, "true");

        try {
            // Read the file as an array buffer and parse it using XLSX.
            const data = await file.arrayBuffer();
            const excelFile = XLSX.read(data, { type: "array" });

            // Prepare arrays for rows to be imported and rows to be skipped.
            const rowsToImport: ExcelWordRow[] = [];
            const rowsSkipped: InvalidRow[] = [];

            // Loop through each sheet in the Excel file and validate rows.
            for (const sheetName of excelFile.SheetNames) {
                const sheet = excelFile.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
                    header: 1,
                });

                // Skip header row, then validate each data row.
                const rowsToValidate = rows.slice(1).map((row) =>
                    shouldSkipRow(row),
                );

                // Separate valid rows and invalid rows. 
                for (const parsedRow of rowsToValidate) {
                    if (parsedRow.skip) {
                        rowsSkipped.push(parsedRow);
                    } else {
                        rowsToImport.push({
                            dialectWord: parsedRow.dialectWord,
                            nationalWord: parsedRow.nationalWord,
                        });
                    }
                }
            }

            if (rowsToImport.length > 0) {
                await importExcelRows(rowsToImport);
            }

            // Create a summary of the import results to display to the user.
            const importSummary =
                "Import klar!\n" +
                    `\nAntal rader kontrollerade: ${rowsToImport.length + rowsSkipped.length}` +
                    `\nAntal rader tillagda: ${rowsToImport.length}` +
                    `\nAntal skippade: ${rowsSkipped.length}`;

            setMessage(importSummary);

        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Okänt fel";
            setMessage("Fel vid import: " + errorMessage);
        } finally {
            sessionStorage.removeItem(EXCEL_IMPORT_IN_PROGRESS);
            setimportLock(false);
        }
    };

    return (
        <div className={style.importExcelSection}>
            <h2>Läs in en Excel-fil</h2>
            <hr />
            <p>
                Se till att Excel-filen är i rätt format innan du importerar.
                Första kolumnen ska innehålla det Morpekanska ordet och Andra
                kolumnen dess motsvarande Översatta ordet.
                <br />
                <strong>
                    [A] Morpekanska ordet
                    <br />
                    [B] Översätta ordet
                    <br />
                </strong>
                <br />
                Tillåtet Format:<small>.xlsx,.xls,.csv</small>
            </p>
            <br />
            <input
                className={style.fileInput}
                id="excel-file"
                type="file"
                disabled={importLock}
                accept=".xlsx,.xls,.csv"
                ref={fileInput}
                />
            <button
                className="btn primary"
                onClick={handleImport}
                disabled={importLock}>
                {importLock ? "Importerar..." : "Importera Fil"}
            </button>
            {message && (
                <div className={style.messageBox}>
                    <pre>{message}</pre>
                </div>
            )}
        </div>
    );
};

export default ImportExcelSection;
