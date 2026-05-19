import { getActiveUserSession } from "@/lib/auth";
import styles from "./page.addWord.module.css";
import AddWordForm2 from "@/components/AddWordForm2";

export default async function AddWord() {
    await getActiveUserSession();

    return (
        <main>
            <div className={styles.Container}>
                <h2 className={styles.Title}>Lägg till nytt Dialektalt ord</h2>
                <AddWordForm2 />
            </div>
        </main>
    );
}
