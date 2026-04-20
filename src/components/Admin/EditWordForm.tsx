import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UpdateDialectword } from "@/actions/dialectwords";
import styles from "./AdminTable.module.css";
import { editWordForm } from "@/types/editWordFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";

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
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError // Missing setError from useForm
    } = useForm<editWordForm>({
        resolver: zodResolver(editWordForm), // missing resolver for validation
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
    }, [id, dialectWord, nationalWord, reset]);

    const onSubmit = async (values: editWordForm) => {
        try {
            await UpdateDialectword({
                id,
                dialectWord: values.dialectWord,
                nationalWord: values.nationalWord,
            });

            onUpdated?.({
                id,
                dialectWord: values.dialectWord,
                nationalWord: values.nationalWord,
            });

            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setError("nationalWord", { message: error.message });
            }
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
                {errors.dialectWord && (
                    <p className={styles.errorText}>
                        {errors.dialectWord.message}
                    </p>
                )}

                <label className={styles.inputGroup}>
                    Svenskt ord
                    <input
                        type="text"
                        {...register("nationalWord", {
                            required: "Svenskt ord är obligatoriskt",
                        })}
                    />
                </label>
                {errors.nationalWord && (
                    <p className={styles.errorText}>
                        {errors.nationalWord.message}
                    </p>
                )}

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
        </form>
    );
}
