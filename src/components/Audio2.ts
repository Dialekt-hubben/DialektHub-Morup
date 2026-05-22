import { addDialectWordServer } from "@/types/DialektFormValidation/addDialectWordServer";
import { addDialectWordClient } from "@/types/DialektFormValidation/dialectWord";
import { useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

function useAudio2() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [recordingSoundFile, setRecordingSoundFile] = useState<FileList | null>(null);

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.start();

        setIsRecording(true);
    }

    async function stopRecording({
        setValue,
    }: {
        setValue: UseFormSetValue<addDialectWordServer>;
    }) {
        if (!mediaRecorderRef.current) {
            return;
        }

        // Stoppa inspelningen, vilket kommer att trigga ondataavailable-eventet där vi hanterar den inspelade ljudfilen
        mediaRecorderRef.current.stop();

        // När data är tillgänglig, skapa en fil och spara den i state
        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
            const audioBlob = event.data;

            const audioFile = new File([audioBlob], "recording.webm", {
                type: "audio/webm",
            });

            console.log("Audio file created:", audioFile);
            const fileList = new DataTransfer();
            fileList.items.add(audioFile);

            console.log({ types: fileList.files.item(0)?.type });

            setRecordingSoundFile(fileList.files);
            setValue("audioFile", audioFile);
        };

        // Stäng av mikrofonen
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
    }

    function playRecording() {
        if (!recordingSoundFile) {
            return;
        }
        const mediaAudio = new Audio();
        const file = recordingSoundFile;
        mediaAudio.src = URL.createObjectURL(file[0]);
        setAudio(mediaAudio);
        mediaAudio.play();
    }

    function pauseRecording() {
        if (!recordingSoundFile) {
            return;
        }
        if (audio) {
            audio.pause();
        }
    }

    return {
        startRecording,
        stopRecording,
        isRecording,
        recordingSoundFile,
        playRecording,
        pauseRecording,
    };
}

export default useAudio2;
