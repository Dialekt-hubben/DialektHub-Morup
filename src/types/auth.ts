import { user } from "@/Drizzle/models/auth-schema";
import { z } from "zod";

export const UserRole = z.enum(["user", "admin"]);

export const Login = z.object({
    email: z.email({ message: "Email är inte giltig" }),
    password: z
        .string()
        .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
});

export const Signup = z
    .object({
        name: z.string().min(2, { message: "Namn måste vara minst 2 tecken långt" }),
        email: z.email({ message: "Email är inte giltig" }),
        password: z
            .string()
            .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
        confirmPassword: z
            .string()
            .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Lösenorden matchar inte",
        path: ["confirmPassword"],
    });

const AdminUserFields = z.object({
    name: z.string().min(2, { message: "Namn måste vara minst 2 tecken långt" }),
    email: z.email({ message: "Email är inte giltig" }),
    role: UserRole,
});

export const AdminSignup = AdminUserFields.extend({
    password: z
        .string()
        .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
});

export const AdminUserUpdate = AdminUserFields.extend({
    id: z.string().min(1),
    password: z.string().refine((value) => value.length === 0 || value.length >= 8, {
        message: "Lösenordet måste vara minst 8 tecken långt",
    }),
});

export const AdminUserForm = AdminUserUpdate.extend({
    id: z.string(),
});

export type UserRole = z.infer<typeof UserRole>;
export type Login = z.infer<typeof Login>;
export type Signup = z.infer<typeof Signup>;
export type AdminSignup = z.infer<typeof AdminSignup>;
export type AdminUserUpdate = z.infer<typeof AdminUserUpdate>;
export type AdminUserForm = z.infer<typeof AdminUserForm>;
export type AuthUser = typeof user.$inferSelect;
