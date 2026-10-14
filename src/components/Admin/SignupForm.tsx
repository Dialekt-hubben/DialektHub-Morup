"use client";

import { InputGroup } from "@/components/InputGroup";
import { AdminSignup, UserRole } from "@/types/auth";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser, generateRandomPassword } from "@/actions/auth";
import { useEffect, useState } from "react";
import styles from "./SignupForm.module.css";
import { redirect } from "next/navigation";
import { FeedbackMessage } from "@/components/FeedbackMessage";

// ICONS: https://copychar.cc/arrows/

type SignupFormProps = { onClose?: () => void };

export function SignupForm({
    onClose = () => {
        redirect("/adminView");
    },
}: SignupFormProps) {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [copyMessage, setCopyMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<AdminSignup>({
        resolver: zodResolver(AdminSignup),
        defaultValues: { role: UserRole.enum.user },
    });

    // Håller e-postadressen synkroniserad med kopieringsfältet.
    const email = useWatch({ control, name: "email" });

    useEffect(() => {
        generateRandomPassword()
            .then((password) => {
                setGeneratedPassword(password);
                setValue("password", password, { shouldValidate: true });
            })
            .catch(() => setError("root", { message: "Kunde inte skapa lösenord" }));
    }, [setError, setValue]);

    const generatePassword = async () => {
        try {
            const password = await generateRandomPassword();
            setGeneratedPassword(password);
            setValue("password", password, { shouldValidate: true });
        } catch {
            setError("root", { message: "Kunde inte skapa lösenord" });
        }
    };

    const copy = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        setCopyMessage(`${label} kopierat`);
        window.setTimeout(() => setCopyMessage(""), 1500);
    };

    const onSubmit = async (data: AdminSignup) => {
        try {
            await createUser(data);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setError("root", { message: error.message });
                return;
            }

            setError("root", { message: "Inkorrekt e-post eller lösenord" });
        }
    };

    return (
        <div
            className={styles.backdrop}
            onClick={(event) => event.target === event.currentTarget && onClose()}>
            <form className={styles.modal} onSubmit={handleSubmit(onSubmit)}>
                {/* Registrera en ny användare */}
                <section className={styles.formSection}>
                    <h2>Registrera Användare</h2>
                    <InputGroup
                        label="Användarnamn"
                        type="text"
                        id="name"
                        {...register("name")}
                        errorMessage={errors.name?.message}
                    />
                    <div className={styles.formGroup}>
                        <label htmlFor="email">E-post</label>
                        <div className={styles.inlineField}>
                            <input id="email" type="email" {...register("email")} />
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => copy(email || "", "E-post")}
                                aria-label="Kopiera e-post">
                                ❐
                            </button>
                        </div>
                        {errors.email?.message && (
                            <p className={styles.error}>{errors.email.message}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="generated-password">Lösenord</label>
                        <div className={styles.inlineField}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="generated-password"
                                {...register("password")}
                                value={generatedPassword}
                                readOnly
                            />
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Dölj lösenord" : "Visa lösenord"
                                }>
                                {showPassword ? "⊚" : "⊝"}
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={generatePassword}
                                aria-label="Generera nytt lösenord">
                                ↻
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => copy(generatedPassword, "Lösenord")}
                                aria-label="Kopiera lösenord">
                                ❐
                            </button>
                        </div>
                    </div>

                    {/* Användarroll */}
                    <div className={styles.formGroup}>
                        <label htmlFor="role">Användarroll</label>
                        <select id="role" {...register("role")}>
                            <option value={UserRole.enum.user}>Användare</option>
                            <option value={UserRole.enum.admin}>Admin</option>
                        </select>
                        {errors.role?.message && (
                            <p className={styles.error}>{errors.role.message}</p>
                        )}
                    </div>
                    {/* Felmeddelande */}
                    {errors.root?.message && (
                        <p className={styles.error} role="alert">
                            {errors.root.message}
                        </p>
                    )}

                    {/* Skapa/Avbryt knappar */}
                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={isSubmitting || !generatedPassword || !email}>
                            Skapa
                        </button>
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Avbryt
                        </button>
                    </div>
                </section>

                {copyMessage && <FeedbackMessage message={copyMessage} />}
            </form>
        </div>
    );
}
