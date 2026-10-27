"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { auth } from "@/lib/auth"
import { AdminSignup, Login, Signup } from "@/types/auth";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";
import { getActiveUserSession } from "@/lib/auth";
import { randomBytes } from "crypto";
import { eq, like } from "drizzle-orm";
import { cache } from "react";
import { refresh } from "next/cache";

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
        await auth.api.signUpEmail({
            body: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: parsedData.data.password,
                role: parsedData.data.role,
                mustChangePassword: true,
            },
        });
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
        refresh();
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

export const getUsers = cache(async (limit: number, offset = 0, email?: string) => {
    const emailFilterCaseInsensitive = email ? like(user.email, `%${email}%`) : undefined;
    try {
        const response = await db.query.user.findMany({
            columns: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            limit,
            offset,
            where: emailFilterCaseInsensitive,
        });

        const totalCount = await db.query.user.findMany({
            columns: {
                id: true,
            },
            where: emailFilterCaseInsensitive,
        });

        return { users: response, totalCount: totalCount.length };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Ett okänt fel inträffade vid hämtning av användare");
    }
});

export async function deleteUser(formdata: FormData) {
    const userid = formdata.get("userId") as string;
    if (!userid) {
        throw new Error("User ID is required");
    }

    const deletedUser = await db.delete(user).where(eq(user.id, userid));

    if (deletedUser[0].affectedRows === 0) {
        throw new Error("Användaren kunde inte tas bort");
    }

    refresh();
}
