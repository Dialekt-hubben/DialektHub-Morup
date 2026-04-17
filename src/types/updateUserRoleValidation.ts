import { UserRole } from "@/types/auth";
import { z } from "zod";

export const updateUserRoleSchema = z.object({
    userId: z.string().min(1, "Ogiltigt användar-id"),
    role: UserRole,
});