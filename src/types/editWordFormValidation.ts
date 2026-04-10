import z from "zod";

export const editWordForm = z.object({
    id: z.number(),
    dialectWord: z.string().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().min(1, "Nationellt ord är obligatoriskt"),
});
export type editWordForm = z.infer<typeof editWordForm>;