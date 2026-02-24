import AddWordForm from "@/components/AddWordForm";
import { getActiveUserSession } from "@/lib/auth";

export default async function AddWord() {
    await getActiveUserSession();

    return (
        <div>
            <div className="Container">
                <h2 className="Title">Add Word</h2>
                <AddWordForm />
            </div>
        </div>
    );
}
