import { useState, useRef } from "react";

export function useAudio() {
    const [audioFile, setAudioFile] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // Convert file/blob to base64
    function fileToBase64(file: File | Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("File is undefined"));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert file to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function startRecording() {
        recordedChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: "audio/webm",
                });
                try {
                    const base64 = await fileToBase64(blob);
                    setAudioFile(base64);
                } catch (error) {
                    if (error instanceof Error) {
                        alert(
                            "Kunde inte konvertera ljudfilen: " + error.message,
                        );
                    }
                    setAudioFile(null);
                }
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            if (err instanceof Error) {
                alert("Kunde inte komma åt mikrofonen: " + err.message);
                return;
            }
            alert("Kunde inte komma åt mikrofonen: " + String(err));
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }

    // async function handleAudioInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     const file = e.target.files && e.target.files[0];
    //     if (file) {
    //         try {
    //             const base64 = await fileToBase64(file);
    //             setAudioFile(base64);
    //         } catch {
    //             setAudioFile(null);
    //         }
    //     }
    // }

    function playBase64Audio(base64: string | null) {
        if (!base64) return;
        const audio = new window.Audio(base64);
        audio.play();
    }

    return {
        audioFile,
        isRecording,
        startRecording,
        stopRecording,
        playBase64Audio,
    };
}
