import ImportExcelSection from "@/components/Admin/ImportExcelSection";
import styles from "./page.module.css";

const ImportExcelPage = () => {
    return (
        <div className={styles.importExcelContainer}>
            <h1>Importera Excel</h1>
            <p>Här kan du importera ord från en Excel-fil.</p>
            <ImportExcelSection />
        </div>
    );
};

export default ImportExcelPage;