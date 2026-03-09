import React from "react";
import style from "@/components/ImportExcelSection.module.css";

const ImportExcelSection: React.FC = () => (
    <div className={style.importExcelSection}>
        <h2>Läs in en Excel-fil</h2>
        <hr />
        <br />
        <p>
            För att importera en Excel-fil, klicka på knappen nedan och välj din
            fil. Filen måste vara i ett av följande format:
            <small>.xlsx,.xls,.csv</small>
        </p>
        <br />
        <input type="file" accept=".xlsx,.xls,.csv" id="excel-file" />
        <button className="btn primary">Importera Fil</button>
        {/* <button className="btn primary" onClick={importExcel.ts}>Importera Fil</button> */}
        {/* När knappen trycks på så ska scriptet läsas in */}
    </div>
);

export default ImportExcelSection;
