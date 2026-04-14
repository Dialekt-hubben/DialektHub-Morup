"use server";

import db from "@/Drizzle";
import { user } from "@/Drizzle/models/auth-schema";
import { getAdminSession } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { updateUserRoleSchema } from "@/types/updateUserRoleValidation";
import { like, sql, asc, eq } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

export async function searchUserByEmail(emailQuery: string) {
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