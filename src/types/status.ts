import z from "zod";

export const Status = z.enum(["pending", "approved", "rejected"]);

export type Status = z.infer<typeof Status>;    