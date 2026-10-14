"use client";

import styles from "./FeedbackMessage.module.css";
import { useEffect, useState } from "react";

type FeedbackMessageProps = {
    message: string;
    duration?: number;
};

export function FeedbackMessage({ message, duration = 5000 }: FeedbackMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsVisible(false), duration);

        return () => window.clearTimeout(timer);
    }, [duration]);

    if (!isVisible) {
        return null;
    }

    return (
        <p className={styles.message} role="status" aria-live="polite">
            <span aria-hidden="true">✓</span> {message}
        </p>
    );
}
