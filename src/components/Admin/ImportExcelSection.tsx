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

function shouldSkipRow(row: any) {
    const dialectWord = row[0].toString().trim();
    const nationalWord = row[1].toString().trim();

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setMessage("Välj en fil först.");
            return;
        }
        setLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer(); // Läs in filen som en array buffer
            const excelFile = XLSX.read(data, { type: "array" }); // Läs in Excel-filen
            const page = excelFile.SheetNames[0]; // Använd den första fliken i Excel-filen
            const sheet = excelFile.Sheets[page]; // Läs in alla rader från den valda fliken
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Konvertera arket till en array av rader, där varje rad är en array av cellvärden

            // Validera och filtrera rader
            const parsedRows = rows.slice(1).map((row) => shouldSkipRow(row));

            // om det finns giltiga rader, importera dem till databasen
            const validRows = parsedRows
                .filter((row) => !row.skip)
                .map((row) => ({
                    dialectWord: row.dialectWord,
                    nationalWord: row.nationalWord,
                }));

            // Räkna antalet skippade rader baserat på valideringsresultatet
            const skippedRows = parsedRows.filter((row) => row.skip);

            // Importera de giltiga raderna till databasen och få resultatett av importen, inklusive eventuella felmeddelanden eller framgångsmeddelanden.
            let result = null;
            if (validRows.length > 0) {
                result = await importExcelRows(validRows);
            }
            setMessage(
                (result?.message || "Import klar!") +
                    `\nAntal importerade: ${validRows.length}
                    \nAntal skippade: ${skippedRows.length}`,
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
                Vissa förutsättningar måste uppfyllas för att importen ska
                lyckas. Se till att din fil är sorterad/uppsatt enligt följande
                kolumner.
                <br />
                <strong>
                    [A] Dialektalt ord
                    <br />
                    [B] Nationellt ord
                    <br />
                    [C] Uttal (alternativt)
                </strong>
                <br />
                Tillåtet Format:<small>.xlsx,.xls,.csv</small>
            </p>
            <br />
            <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} />
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
