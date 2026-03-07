"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputGroup } from "./InputGroup";
import { useForm } from "react-hook-form";
import { addDialectWord } from "@/types/DialektFormValidation/dialectWord";
import { useAudio } from "./Audio";
import styles from "./AddWordForm.module.css";
import { useState } from "react";
import Link from "next/link";

function AddWordForm() {
    const [isRrecording, setisRrecording] = useState(false);
    const { startRecording, stopRecording } = useAudio();
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
        if (data.audioFile && data.audioFile) {
            formdata.append("audioFile", data.audioFile);
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

        console.log(await response.json());
    };

    return (
        <>
            <form
                className={styles.addWordForm}
                onSubmit={handleSubmit(onSubmit)}>
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
        </>
    );
}

export default AddWordForm;
