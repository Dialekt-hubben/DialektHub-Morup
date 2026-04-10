import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UpdateDialectword } from "@/actions/dialectwords";
import styles from "./AdminTable.module.css";
import { editWordForm } from "@/types/editWordFormValidation";

// Typ för data som skickas tillbaka när ett ord har uppdaterats
export type EditWordFormUpdatedData = {
    id: number;
    dialectWord: string;
    nationalWord: string;
};

// Props för EditWordForm-komponenten
interface EditWordFormProps {
    id: number;
    dialectWord: string;
    nationalWord: string;
    onClose: () => void;
    onUpdated?: (updated: EditWordFormUpdatedData) => void;
}

export default function EditWordForm({
    id,
    dialectWord,
    nationalWord,
    onClose,
    onUpdated,
}: EditWordFormProps) {
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<editWordForm>({
        defaultValues: {
            id,
            dialectWord,
            nationalWord,
        },
    });

    // Uppdatera formulärets default values så att det alltid visar rätt data när
    // EditWordForm öppnas eller när ett nytt ord väljs att redigera.
    useEffect(() => {
        reset({
            id,
            dialectWord,
            nationalWord,
        });
    }, [dialectWord, nationalWord, reset]);

    const onSubmit = async (values: editWordForm) => {
        setError("");

        const trimmedDialectWord = values.dialectWord.trim();
        const trimmedNationalWord = values.nationalWord.trim();

        if (!trimmedDialectWord || !trimmedNationalWord) {
            setError("Både dialektord och svenskt ord måste fyllas i.");
            return;
        }

        try {
            await UpdateDialectword({
                id,
                dialectWord: trimmedDialectWord,
                nationalWord: trimmedNationalWord,
            });

            onUpdated?.({
                id,
                dialectWord: trimmedDialectWord,
                nationalWord: trimmedNationalWord,
            });

            onClose();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Något gick fel.";
            setError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.editForm}>
                <label className={styles.inputGroup}>
                    Dialektord
                    <input
                        type="text"
                        {...register("dialectWord", {
                            required: "Dialektord är obligatoriskt",
                        })}
                    />
                </label>

                <label className={styles.inputGroup}>
                    Svenskt ord
                    <input
                        type="text"
                        {...register("nationalWord", {
                            required: "Svenskt ord är obligatoriskt",
                        })}
                    />
                </label>

                <div className={styles.editActions}>
                    <button type="submit" className="btn primary">
                        Spara
                    </button>
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={onClose}>
                        Avbryt
                    </button>
                </div>
            </div>

            {errors.dialectWord && (
                <p className={styles.errorText}>{errors.dialectWord.message}</p>
            )}
            {errors.nationalWord && (
                <p className={styles.errorText}>{errors.nationalWord.message}</p>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
        </form>
    );
}
