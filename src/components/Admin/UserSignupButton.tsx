"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignupForm } from "./SignupForm";
import { AuthUser } from "@/types/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog } from "@fortawesome/free-solid-svg-icons";

// Pick only the fields needed for editing a user.
type EditUser = Pick<AuthUser, "id" | "name" | "email" | "role">;

export function UserSignupButton({ user }: { user?: EditUser }) {
    const router = useRouter();
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    const closeSignup = () => {
        setIsSignupOpen(false);
        router.refresh();
    };

    return (
        <>
            <button
                type="button"
                className={user ? undefined : "btn primary"}
                onClick={() => setIsSignupOpen(true)}>
                {user ? (
                    <>
                        <span>Redigera användare</span>
                        <FontAwesomeIcon size="xl" icon={faUserCog} />
                    </>
                ) : (
                    "Lägg till ny användare"
                )}
            </button>
            {isSignupOpen && <SignupForm user={user} onClose={closeSignup} />}
        </>
    );
}
