import { Dispatch, SetStateAction } from "react";

export default function playSound(
    url: string,
    setActiveSoundUrl: Dispatch<SetStateAction<string | null>>,
) {
    const audio = new window.Audio(url);

    audio.onended = () => {
        setActiveSoundUrl((currentUrl) => (currentUrl === url ? null : currentUrl));
    };

    audio.play().catch(() => {
        setActiveSoundUrl((currentUrl) => (currentUrl === url ? null : currentUrl));
    });
}
