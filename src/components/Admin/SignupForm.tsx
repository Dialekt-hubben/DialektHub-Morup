"use client";

import { InputGroup } from "@/components/InputGroup";
import { AdminSignup, AdminUserForm, AdminUserUpdate, UserRole } from "@/types/auth";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser, generateRandomPassword, updateUser } from "@/actions/auth";
import { useEffect, useState } from "react";
import styles from "./SignupForm.module.css";
import { redirect } from "next/navigation";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faEye, faEyeSlash, faRedo } from "@fortawesome/free-solid-svg-icons";

// Pick only the fields needed for editing a user.
type EditUser = Pick<AdminUserUpdate, "id" | "name" | "email" | "role">;
type SignupFormProps = { onClose?: () => void; user?: EditUser };

export function SignupForm({
    onClose = () => {
        redirect("/adminView");
    },
    user,
}: SignupFormProps) {
    // Samma modal används för både registrering och redigering.
    const isEditMode = Boolean(user);
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
    } = useForm<AdminUserForm>({
        resolver: zodResolver(AdminUserForm),
        // Om det finns en användare att redigera, fyller vi formuläret med dens data och ett tomt lösenord.
        defaultValues: user
            ? { ...user, password: "" }
            : { id: "", name: "", email: "", password: "", role: UserRole.enum.user },
    });

    // Håller e-postadressen och lösenordet synkroniserad med formulärdatan för att kunna kopiera dem.
    const email = useWatch({ control, name: "email" });
    const password = useWatch({ control, name: "password" });

    // Nya användare får ett genererat lösenord, medan redigering börjar tomt.
    useEffect(() => {
        if (!isEditMode) {
            generateRandomPassword()
                .then((password) => {
                    setGeneratedPassword(password);
                    setValue("password", password, { shouldValidate: true });
                })
                .catch(() => setError("root", { message: "Kunde inte skapa lösenord" }));
        }
    }, [isEditMode, setError, setValue]);

    // Genererar ett nytt lösenord och sätter det som det aktuella lösenordet i formuläret.
    const generatePassword = async () => {
        try {
            const password = await generateRandomPassword();
            setGeneratedPassword(password);
            setValue("password", password, { shouldValidate: true });
        } catch {
            setError("root", { message: "Kunde inte skapa lösenord" });
        }
    };

    // Kopierar värdet till urklipp och visar ett meddelande.
    const copy = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        setCopyMessage(`${label} kopierat`);
        window.setTimeout(() => setCopyMessage(""), 1500);
    };

    const onSubmit = async (data: AdminUserForm) => {
        try {
            if (isEditMode) {
                await updateUser(AdminUserUpdate.parse(data));
            } else {
                await createUser(AdminSignup.parse(data));
            }
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
                    <h2>{isEditMode ? "Redigera Användare" : "Registrera Användare"}</h2>
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
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                readOnly={isEditMode}
                            />
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => copy(email || "", "E-post")}
                                aria-label="Kopiera e-post">
                                <FontAwesomeIcon icon={faCopy} />
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
                                value={isEditMode ? undefined : generatedPassword}
                                readOnly={!isEditMode}
                                placeholder={
                                    isEditMode
                                        ? "Lämna tomt för att behålla nuvarande lösenord"
                                        : undefined
                                }
                            />
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Dölj lösenord" : "Visa lösenord"
                                }>
                                <FontAwesomeIcon
                                    icon={showPassword ? faEye : faEyeSlash}
                                />
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={generatePassword}
                                aria-label="Generera nytt lösenord">
                                <FontAwesomeIcon icon={faRedo} />
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => copy(password || "", "Lösenord")}
                                aria-label="Kopiera lösenord">
                                <FontAwesomeIcon icon={faCopy} />
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

                    {/* Skapa/uppdatera/avbryt knappar */}
                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={
                                isSubmitting ||
                                !email ||
                                (!isEditMode && !generatedPassword)
                            }>
                            {isEditMode ? "Uppdatera" : "Skapa"}
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
