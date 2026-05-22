"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputGroup } from "./InputGroup";
import { useForm } from "react-hook-form";
import { addDialectWordClient } from "@/types/DialektFormValidation/dialectWord";
import styles from "./AddWordForm.module.css";
import Link from "next/link";
import { CreateDialectWord } from "@/actions/dialectwords";
import useAudio2 from "./Audio2";

function AddWordForm2() {
    const {
        recordingSoundFile,
        isRecording,
        startRecording,
        stopRecording,
        playRecording,
    } = useAudio2();
    const {
        handleSubmit,
        register,
        formState: { errors },
        setError,
        setValue,
    } = useForm({
        defaultValues: {
            dialectWord: "test1",
            nationalWord: "test1",
        },
        resolver: zodResolver(addDialectWordClient),
    });

    const onSubmit = async (data: addDialectWordClient) => {
        try {
            await CreateDialectWord(data);
        } catch (error) {
            if (error instanceof Error) {
                setError("root", {
                    message: error.message,
                });
            }
        }
    };

    return (
        <div>
            <form className={styles.addWordForm} onSubmit={handleSubmit(onSubmit)}>
                <h2>Lägg till nytt ord 2</h2>
                <InputGroup
                    label="Dialekt ord"
                    placeholder="Skriv dialekt ordet här..."
                    {...register("dialectWord")}
                    errorMessage={errors.dialectWord?.message}
                />
                <InputGroup
                    label="Svenskt ord"
                    placeholder="Skriv det svenska ordet här..."
                    {...register("nationalWord")}
                    errorMessage={errors.nationalWord?.message}
                />
                <br />
                <p>Ladda upp en ljudfil eller spela in direkt</p>
                <InputGroup
                    type="file"
                    label="ljud fil"
                    accept="audio/*"
                    placeholder="Upload an audio file..."
                    {...register("audioFile")}
                    errorMessage={errors.audioFile?.message?.toString()}
                />
                {errors.root && <p>{errors.root.message}</p>}
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
                            onClick={() => stopRecording({ setValue })}>
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
                <button className="btn primary">Spara ord</button>
                <Link href="/" className="btn primary">
                    Avbryt
                </Link>
            </form>
            {recordingSoundFile && (
                <>
                    <p>Inspelning pågår...</p>
                    <pre>{recordingSoundFile[0].name}</pre>
                </>
            )}
        </div>
    );
}
export default AddWordForm2;
