"use client";

import React, { useRef, useState } from "react";
import style from "@/components/Admin/ImportExcelSection.module.css";
import { importExcelRows } from "@/actions/importExcelToDb";
import * as XLSX from "xlsx";

// Denna komponent är ansvarig för att hantera importen av Excel-filer. Den innehåller en filuppladdningsfunktion och en knapp för att starta importprocessen.
// När knappen klickas, läses den valda Excel-filen in, och varje rad i filen behandlas och sparas i databasen via importExcelRows-funktionen.
// Eventuella rader som inte kan importeras på grund av valideringsfel kommer att lämnas kvar i Excel-filen för manuell granskning och korrigering.
// OBS: För att denna komponent ska fungera korrekt, måste importExcelRows-funktionen vara ordentligt implementerad för att hantera filinläsning, validering och databasinteraktion.
// Dessutom måste nödvändiga beroenden som XLSX-biblioteket vara installerade och korrekt konfigurerade i projektet.
type Row = [Dialekt: string, Svenska: string];

function shouldSkipRow(row: Row | any[]) {
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

const ImportExcelSection: React.FC = () => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleImport = async () => {
        const file = fileInput.current?.files?.[0];
        if (!file) {
            setMessage("Välj en fil först.");
            return;
        }
        setLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer();
            const excelFile = XLSX.read(data, { type: "array" });

            let allValidRows: { dialectWord: string; nationalWord: string }[] =
                [];
            let allSkippedRows: any[] = [];

            for (const sheetName of excelFile.SheetNames) {
                const sheet = excelFile.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const parsedRows = rows
                    .slice(1)
                    .map((row) => shouldSkipRow(row as Row));

                const validRows = parsedRows
                    .filter((row) => !row.skip)
                    .map((row) => ({
                        dialectWord: row.dialectWord,
                        nationalWord: row.nationalWord,
                    }));

                const skippedRows = parsedRows.filter((row) => row.skip);

                allValidRows.push(...validRows);
                allSkippedRows.push(...skippedRows);
            }

            let result = null;
            if (allValidRows.length > 0) {
                result = await importExcelRows(allValidRows);
            }
            setMessage(
                "Import klar!" +
                    `\nAntal rader kontrollerade: ${allValidRows.length + allSkippedRows.length}` +
                    `\nAntal rader tillgda: ${allValidRows.length}` +
                    `\nAntal skippade: ${allSkippedRows.length}`,
            );
        } catch (err: any) {
            setMessage("Fel vid import: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.importExcelSection}>
            <h2>Läs in en Excel-fil</h2>
            <hr />
            <p>
                Se till att Excel-filen är i rätt format innan du importerar.
                Första kolumnen ska innehålla det dialektala ordet och Andra
                kolumnen dess motsvarande nationella ord.
                <br />
                <strong>
                    [A] Dialektalt ord
                    <br />
                    [B] Nationellt ord
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
                disabled={loading}
                accept=".xlsx,.xls,.csv"
                ref={fileInput}
            />
            <button
                className="btn primary"
                onClick={handleImport}
                disabled={loading}>
                {loading ? "Importerar..." : "Importera Fil"}
            </button>
            {message && (
                <div style={{ marginTop: 10, whiteSpace: "pre-line" }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ImportExcelSection;
