"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputGroup } from "./InputGroup";
import { useForm } from "react-hook-form";
import { addDialectWord } from "@/types/DialektFormValidation/dialectWord";
import { useAudio } from "./Audio";
import styles from "./AddWordForm.module.css";
import { useState } from "react";
import Link from "next/link";
import { CreateDialectWord } from "@/actions/dialectwords";

function AddWordForm() {
    const [isRrecording, setisRrecording] = useState(false);
    const { startRecording, stopRecording } = useAudio();
    const {
        handleSubmit,
        register,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(addDialectWord),
    });

    const startAudioRecording = () => {
        console.log("Record button clicked");
        setisRrecording(true);
        startRecording();
    };

    const stopAudioRecording = () => {
        console.log("Stop button clicked");
        setisRrecording(false);
        stopRecording();
    };

    const onSubmit = async (data: addDialectWord) => {
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
            <form
                className={styles.addWordForm}
                onSubmit={handleSubmit(onSubmit)}>
                <h2>Lägg till nytt ord</h2>
                <InputGroup
                    label="Dialekt ord"
                    placeholder="Skriv dialekt ordet här..."
                    {...register("dialectWord")}
                    errorMessage={errors.dialectWord?.message}
                />
                <InputGroup
                    label="Svenskt ord"
                    placeholder="Skriv det översatta ordet här..."
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
                {errors.root && (
                    <p>{errors.root.message}</p>
                )}
                <div>
                    {!isRrecording ? (
                        <button
                            type="button"
                            className="btn primary"
                            disabled
                            onClick={startAudioRecording}>
                            Spela in
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn primary"
                            onClick={stopAudioRecording}>
                            Stoppa inspelning
                        </button>
                    )}
                </div>
                <button className="btn primary">Spara ord</button>
                <Link href="/" className="btn primary">
                    Avbryt
                </Link>
            </form>
        </div>
    );
}

export default AddWordForm;
