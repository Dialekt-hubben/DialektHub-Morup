"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputGroup } from "./InputGroup";
import { useForm } from "react-hook-form";
import { addDialectWord } from "@/types/dialectword";
import { useAudio } from "./Audio";
import styles from "./AddWordForm.module.css";
import { useState } from "react";
import Link from "next/link";

function AddWordForm() {
    const [isRrecording, setisRrecording] = useState(false);
    const { startRecording, stopRecording, audioFile } = useAudio();
    const {
        handleSubmit,
        register,
        formState: { errors },
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
        const formdata = new FormData();
        formdata.append("word", data.word);
        formdata.append("pronunciation", data.pronunciation);
        if (data.audioFile && data.audioFile.length > 0) {
            formdata.append("audioFile", data.audioFile[0]);
        }
        const response = await fetch("/api/dialectwords", {
            method: "POST",
            body: formdata,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error submitting form:", errorData.error);
            return;
        }

        console.log(response);
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
                    {...register("word")}
                    errorMessage={errors.word?.message}
                />
                <InputGroup
                    label="Svenskt ord"
                    placeholder="Skriv det svenska ordet här..."
                    {...register("pronunciation")}
                    errorMessage={errors.pronunciation?.message}
                />
                <br />
                <p>Ladda upp en ljudfil eller spela in direkt</p>
                <InputGroup
                    type="file"
                    label="ljud fil"
                    accept="audio/mpeg,audio/wav,audio/ogg"
                    placeholder="Upload an audio file..."
                    {...register("audioFile")}
                    errorMessage={errors.audioFile?.message?.toString()}
                />
                <div>
                    {!isRrecording ? (
                        <button
                            type="button"
                            className="btn primary"
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
