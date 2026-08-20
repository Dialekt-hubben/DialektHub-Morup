"use client";
import { useForm } from "react-hook-form";
import { UpdateDialectWord } from "@/actions/dialectwords";
import styles from "./AdminTable.module.css";
// import { editWordFormSchema, type editWordForm } from "@/types/editWordFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import useAudio from "../Audio";
import { updateDialectWord } from "@/types/DialektFormValidation/dialectWord";
import { InputGroup } from "../InputGroup";

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
        handleSubmit,
        register,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(updateDialectWord),
        defaultValues: {
            dialectWord: dialectWord,
            nationalWord: nationalWord,
            audioFile: null,
            id,
        },
    });

    const onSubmit = async (data: updateDialectWord) => {
        console.log({ data });

        try {
            if (onUpdated) {
                onUpdated(data);
            }

            await UpdateDialectWord(data);
        } catch (error) {
            console.error("Error updating word:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.editForm}>
                <InputGroup
                    label="Dialektord"
                    errorMessage={errors.dialectWord?.message}
                    {...register("dialectWord")}
                />
                <InputGroup
                    label="Svenskt ord"
                    errorMessage={errors.nationalWord?.message}
                    {...register("nationalWord")}
                />
                <div className={styles.inputGroup}>
                    <p>Ljudfil</p>
                    <div>
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
                                    stopRecording({ setValue, fieldName: "audioFile" })
                                }>
                                Stoppa inspelning
                            </button>
                        )}
                        {recordingSoundFile && (
                            <button
                                type="button"
                                className="btn primary"
                                onClick={() => playRecording()}>
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
