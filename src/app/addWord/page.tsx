import AddWordForm from "@/components/AddWordForm";
import { getActiveUserSession } from "@/lib/auth";
import styles from "./page.addWord.module.css";

export default async function AddWord() {
    await getActiveUserSession();

    return (
        <main>
            <div className={styles.Container}>
                <AddWordForm />
            </div>
        </main>
    );
}
