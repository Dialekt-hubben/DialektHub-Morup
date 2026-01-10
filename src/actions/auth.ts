"use server";

import { auth } from "@/lib/auth";
import { Login, Signup } from "@/types/auth";
import { headers } from "next/headers";

export async function signUp(data: Signup) {
    const response = await auth.api.signUpEmail({
        body: {
            name: data.name,
            email: data.email,
            password: data.password
        }
    });
    return response;
}

export async function signIn(data: Login) {
    const response = await auth.api.signInEmail({
        body: {
            email: data.email,
            password: data.password
        }
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