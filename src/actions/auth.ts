"use server";

import { auth } from "@/lib/auth";
import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { AdminSignup, Login, Signup } from "@/types/auth";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";
import { getActiveUserSession } from "@/lib/auth";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

function generatePassword() {
    return randomBytes(9).toString("base64");
}

export async function generateRandomPassword() {
    await getAdminSession();
    return generatePassword();
}

export async function changeOwnPassword(data: {
    currentPassword: string;
    newPassword: string;
}) {
    const currentUser = await getActiveUserSession();

    if (
        data.currentPassword.length < 8 ||
        data.newPassword.length < 8 ||
        data.currentPassword === data.newPassword
    ) {
        throw new Error("Lösenorden måste vara minst 8 tecken och skilja sig åt");
    }

    try {
        await auth.api.changePassword({
            headers: await headers(),
            body: {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                revokeOtherSessions: true,
            },
        });
    } catch {
        throw new Error("Det gamla lösenordet är fel");
    }

    await db
        .update(user)
        .set({ mustChangePassword: false })
        .where(eq(user.id, currentUser.id));
}

export async function createUser(data: AdminSignup) {
    await getAdminSession();

    const parsedData = AdminSignup.safeParse(data);
    if (!parsedData.success) {
        throw new Error("Ogiltiga användaruppgifter");
    }

    try {
        const response = await auth.api.signUpEmail({
            body: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: parsedData.data.password,
            },
        });

        if (response.user) {
            await db
                .update(user)
                .set({
                    role: parsedData.data.role,
                    mustChangePassword: true,
                })
                .where(eq(user.id, response.user.id));
        }

        return { email: parsedData.data.email, password: parsedData.data.password };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Ett okänt fel inträffade under registreringen");
    }
}

export async function signUp(data: Signup) {
    const parsedData = Signup.safeParse(data);

    if (!parsedData.success) {
        throw new Error("Ogiltiga registreringsuppgifter");
    }

    try {
        const response = await auth.api.signUpEmail({
            body: parsedData.data,
        });
        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }

        throw new Error("Ett okänt fel inträffade under registreringen");
    }
}

export async function signIn(data: Login) {
    const parsedData = Login.safeParse(data);

    if (!parsedData.success) {
        throw new Error("Ogiltiga inloggningsuppgifter");
    }

    try {
        const response = await auth.api.signInEmail({
            body: parsedData.data,
        });

        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Ett okänt fel inträffade under inloggningen");
    }
}

export async function signOut() {
    await auth.api.signOut({
        headers: await headers(),
    });
}
