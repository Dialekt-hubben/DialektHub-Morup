"use client";

import { useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "./SoundIcon";

type SoundButtonProps = {
    url: string;
};

export default function SoundButton({ url }: SoundButtonProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayback = async () => {
        const audio = audioRef.current ?? new window.Audio(url);
        audioRef.current = audio;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        audio.currentTime = 0;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        try {
            await audio.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
        }
    };

    return (
        <button
            style={{
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                backgroundColor: "transparent",
            }}
            type="button"
            aria-label={isPlaying ? "Pausa ljud" : "Spela upp ljud"}
            onClick={togglePlayback}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
    );
}
