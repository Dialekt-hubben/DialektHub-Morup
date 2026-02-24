"use client";
import { InputGroup } from "@/components/InputGroup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDialectWord } from "@/types/dialectword";
import { useAudio } from "@/components/Audio";

export default function AddWord() {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addDialectWord),
    });

    const { startRecording, stopRecording } = useAudio();

    const onSubmit = (data: addDialectWord) => {
        console.log(data);
    };

    const startAudioRecording = () => {
        console.log("Record button clicked");
        startRecording();
    };

    const stopAudioRecording = () => {
        console.log("Stop button clicked");
        stopRecording();
    };

    return (
        <div>
            <div className="Container">
                <h2 className="Title">Add Word</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                        accept="audio/.mp3"
                        placeholder="Upload an audio file..."
                        {...register("audioFile")}
                        errorMessage={errors.audioFile?.message}
                    />
                    <div>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={startAudioRecording}>
                            Spela in
                        </button>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={stopAudioRecording}>
                            Stoppa inspelning
                        </button>
                    </div>
                    <button className="btn primary">Spara ord</button>
                    <button className="btn primary">Avbryt</button>
                </form>
            </div>
        </div>
    );
}
