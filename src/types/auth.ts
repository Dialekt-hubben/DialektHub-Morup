import { user } from "@/Drizzle/models/auth-schema";
import { z } from "zod";

export const Login = z.object({
    email: z.email({ message: "Email är inte giltig" }),
    password: z.string().min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
});

export const Signup = z.object({
    name: z.string().min(2, { message: "Namn måste vara minst 2 tecken långt" }),
    email: z.email({ message: "Email är inte giltig" }),
    password: z
        .string()
        .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" }),
    confirmPassword: z
        .string()
        .min(8, { message: "Lösenordet måste vara minst 8 tecken långt" })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Lösenorden matchar inte",
    path: ["confirmPassword"],
});

export type Login = z.infer<typeof Login>;
export type Signup = z.infer<typeof Signup>;
export type AuthUser = typeof user.$inferSelect;