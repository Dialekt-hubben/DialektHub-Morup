"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { auth } from "@/lib/auth";
import { Login, Signup } from "@/types/auth";
import { eq } from "drizzle-orm";
import { cacheTag, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";

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

export const getUsers = cache(async function (limit: number, offset = 0) {
    cacheTag("users");
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
        });

        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Ett okänt fel inträffade vid hämtning av användare");
    }
});

export async function deleteUser(userid: string) {
    const deletedUser = await db.delete(user).where(eq(user.id, userid));

    if (deletedUser[0].affectedRows === 0) {
        throw new Error("Användaren kunde inte tas bort");
    }

    revalidateTag("users", { expire: 0 });
}
