import z from "zod";
import { AllowedFileTypes, MaxFileSize } from "./audioFileConstraints";

export const addDialectWordServer = z.object({
    dialectWord: z.string().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().min(1, "Nationellt ord är obligatoriskt"),
    audioFile: z
        .file()
        .nullable()
        .refine(
            (file) =>
                !file || !file || !AllowedFileTypes.includes(file.type.toLowerCase()),
            "Bara ljudfiler av typen mp3, wav, ogg eller mpeg är tillåtna",
        )
        .refine(
            (file) => !file || file.size <= MaxFileSize,
            "Filen får inte vara större än 5MB",
        ),
});

export type addDialectWordServer = z.infer<typeof addDialectWordServer>;