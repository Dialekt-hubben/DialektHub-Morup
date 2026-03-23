import React from "react";
import style from "@/components/Admin/ImportExcelSection.module.css";

const ImportExcelSection: React.FC = (file) => (
    <div className={style.importExcelSection}>
        <h2>Läs in en Excel-fil</h2>
        <hr />
        <p>
            Vissa förutsättningar måste uppfyllas för att importen ska lyckas.
            Se till att din fil är sorterad/uppsatt enligt följande kolumner.
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
        <input type="file" accept=".xlsx,.xls,.csv" id="excel-file" />
        <button className="btn primary">Importera Fil</button>
        {/* <button className="btn primary" onClick={importExcel.ts}>Importera Fil</button> */}
        {/* När knappen trycks på så ska scriptet läsas in */}
    </div>
);

export default ImportExcelSection;
