import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UpdateDialectword } from "@/actions/dialectwords";
import styles from "./AdminTable.module.css";
import { editWordForm } from "@/types/editWordFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";

export type EditWordFormUpdatedData = {
    id: number;
    dialectWord: string;
    nationalWord: string;
};
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
        setError
    } = useForm<editWordForm>({
        resolver: zodResolver(editWordForm),
        defaultValues: {
            id,
            dialectWord,
            nationalWord,
        },
    });

    // Update the form's default values so that it always shows the correct data
    // when EditWordForm is opened or when a new word is selected for editing.
    useEffect(() => {
        reset({
            id,
            dialectWord,
            nationalWord,
        });
    }, [id, dialectWord, nationalWord, reset]);

    // Handle form submission by calling the UpdateDialectword action and passing the updated data.
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
