"use server";

import { auth } from "@/lib/auth";
import { Login, Signup } from "@/types/auth";
import { headers } from "next/headers";

export async function signUp(data: Signup) {
    const parsedData = Signup.safeParse(data);

    if (!parsedData.success) {
        throw new Error("Ogiltiga registreringsuppgifter");
    }

    const response = await auth.api.signUpEmail({
        body: parsedData.data
    });
    return response;
}

export async function signIn(data: Login) {
    const parsedData = Login.safeParse(data);
    
    if (!parsedData.success) {
        throw new Error("Ogiltiga inloggningsuppgifter");
    }

    const response = await auth.api.signInEmail({
        body: parsedData.data
    });
    
    return response;
}

export async function signOut() {
    await auth.api.signOut(
        {
            headers: await headers()
        }
    );
}