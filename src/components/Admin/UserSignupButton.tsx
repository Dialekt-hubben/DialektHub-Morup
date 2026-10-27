"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignupForm } from "./SignupForm";

export function UserSignupButton() {
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
                className="btn primary"
                onClick={() => setIsSignupOpen(true)}>
                Lägg till användare
            </button>
            {isSignupOpen && <SignupForm onClose={closeSignup} />}
        </>
    );
}
