"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { auth } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth";
import { Login, Signup, UserRole } from "@/types/auth";
import { updateUserRoleSchema } from "@/types/updateUserRoleValidation";
import { asc, eq, like, sql } from "drizzle-orm";
import { headers } from "next/headers";
// import { revalidatePath } from "next/cache";

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

export async function searchUsersByEmail(emailQuery: string) {
    await getAdminSession();

    const normalizedQuery = emailQuery.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }

    return db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        })
        .from(user)
        .where(like(sql`lower(${user.email})`, `%${normalizedQuery}%`))
        .orderBy(asc(user.email));
}

export async function updateUserRole(input: { userId: string; role: UserRole; }) {
    await getAdminSession();

    const parsed = updateUserRoleSchema.safeParse(input);

    if (!parsed.success) {
        throw new Error("Ogiltig rolluppdatering");
    }

    await db
        .update(user)
        .set({ role: parsed.data.role })
        .where(eq(user.id, parsed.data.userId));

    // revalidatePath("/admin");
}


