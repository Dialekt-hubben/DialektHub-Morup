import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UpdateDialectWord } from "@/actions/dialectwords";
import styles from "./AdminTable.module.css";
// import { editWordFormSchema, type editWordForm } from "@/types/editWordFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import useAudio from "../Audio";
import { updateDialectWord } from "@/types/DialektFormValidation/dialectWord";

export type EditWordFormUpdatedData = {
    id: number;
    dialectWord: string;
    nationalWord: string;
    audioFile?: File | null;
};
interface EditWordFormProps {
    id: number;
    dialectWord: string;
    nationalWord: string;
    currentAudioFileName?: string | null;
    onClose: () => void;
    onUpdated?: (updated: updateDialectWord) => void;
}

export default function EditWordForm({
    id,
    dialectWord,
    nationalWord,
    currentAudioFileName,
    onClose,
    onUpdated,
}: EditWordFormProps) {
    const {
        recordingSoundFile,
        isRecording,
        startRecording,
        stopRecording,
        playRecording,
    } = useAudio();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(updateDialectWord),
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
    const onSubmit = async (values: updateDialectWord) => {
        try {
            // const selectedAudioFile =
            //     recordingSoundFile ??
            //     (values.audioFile instanceof File
            //         ? values.audioFile
            //         : values.audioFile instanceof FileList
            //           ? (values.audioFile.item(0) ?? null)
            //           : null);

            const selectedAudioFile =
                recordingSoundFile ??
                (values.audioFile instanceof File ? values.audioFile : null);

            await UpdateDialectWord({
                id,
                dialectWord: values.dialectWord,
                nationalWord: values.nationalWord,
                audioFile: selectedAudioFile,
            });

            onUpdated?.({
                id,
                dialectWord: values.dialectWord,
                nationalWord: values.nationalWord,
                audioFile: selectedAudioFile,
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
                    <p className={styles.errorText}>{errors.dialectWord.message}</p>
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
                    <p className={styles.errorText}>{errors.nationalWord.message}</p>
                )}
                <div className={styles.inputGroup}>
                    <p>Ljudfil</p>
                    <div className={styles.audioActions}>
                        {!isRecording ? (
                            <button
                                type="button"
                                className="btn primary"
                                onClick={startRecording}>
                                Spela in
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn primary"
                                onClick={() =>
                                    stopRecording({
                                        setValue,
                                        fieldName: "audioFile",
                                    })
                                }>
                                Stoppa inspelning
                            </button>
                        )}
                        {recordingSoundFile && (
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={playRecording}>
                                Spela upp inspelning
                            </button>
                        )}
                    </div>
                    {errors.audioFile && (
                        <p className={styles.errorText}>{errors.audioFile.message}</p>
                    )}
                </div>
                {currentAudioFileName ? (
                    <p>Nuvarande ljudfil: {currentAudioFileName}</p>
                ) : (
                    <p>Ingen ljudfil är kopplad ännu.</p>
                )}
                {recordingSoundFile && (
                    <p>Ny inspelning vald: {recordingSoundFile.name}</p>
                )}

                <div className={styles.editActions}>
                    <button type="submit" className="btn primary">
                        Spara
                    </button>
                    <button type="button" className="btn secondary" onClick={onClose}>
                        Avbryt
                    </button>
                </div>
            </div>
        </form>
    );
}
