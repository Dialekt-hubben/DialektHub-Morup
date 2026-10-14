"use client";

import { changeOwnPassword, signOut } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./ChangePasswordModal.module.css";
import { FeedbackMessage } from "../FeedbackMessage";

type ChangePasswordModalProps = { email: string };

export function ChangePasswordModal({ email }: ChangePasswordModalProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    const submit = (formData: FormData) => {
        setError("");

        const currentPassword = String(formData.get("currentPassword") ?? "");
        const newPassword = String(formData.get("newPassword") ?? "");
        const repeatedPassword = String(formData.get("repeatedPassword") ?? "");

        if (newPassword !== repeatedPassword) {
            setError("De nya lösenorden matchar inte");
            return;
        }

        // StartTransition is used to indicate a non-urgent update, allowing React to prioritize more urgent updates and keep the UI responsive.
        // https://react.dev/reference/react/useTransition#starttransition
        startTransition(async () => {
            try {
                await changeOwnPassword({ currentPassword, newPassword });
                router.refresh();
            } catch (error) {
                setError(
                    error instanceof Error ? error.message : "Kunde inte byta lösenord",
                );
            }
        });
    };

    const cancel = () => {
        setError("");

        startTransition(async () => {
            try {
                await signOut();
                router.push("/");
                router.refresh();
            } catch (error) {
                setError(error instanceof Error ? error.message : "Kunde inte logga ut");
            }
        });
    };

    return (
        <div className={styles.passwordModalBackdrop} role="dialog" aria-modal="true">
            <form className={styles.passwordModal} action={submit}>
                <h2>Byt lösenord</h2>
                <p>Du måste byta ditt lösenord innan du kan fortsätta.</p>
                <label>
                    E-post
                    <input type="email" value={email} readOnly />
                </label>
                <label>
                    Gammalt lösenord
                    <input
                        name="currentPassword"
                        type="password"
                        required
                        minLength={8}
                    />
                </label>
                <label>
                    Nytt lösenord
                    <input name="newPassword" type="password" required minLength={8} />
                </label>
                <label>
                    Upprepa nytt lösenord
                    <input
                        name="repeatedPassword"
                        type="password"
                        required
                        minLength={8}
                    />
                </label>
                {error && <p role="alert">{error}</p>}
                <div>
                    <button className="btn primary" type="submit" disabled={isPending}>
                        Byt lösenord
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={cancel}
                        disabled={isPending}>
                        Avbryt
                    </button>
                </div>
                {isPending && <FeedbackMessage message="Lösenordet byts..." />}
            </form>
        </div>
    );
}
