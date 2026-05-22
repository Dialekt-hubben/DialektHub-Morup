import z from "zod";
import { AllowedFileTypes, MaxFileSize } from "./audioFileConstraints";
import { baseDialectWordSchema } from "./dialectWord";

export const addDialectWordServer = baseDialectWordSchema.extend({
    audioFile: z
        .file()
        .nullable()
        .refine(
            (file) =>
                !file || AllowedFileTypes.includes(file.type.toLowerCase()),
            "Bara ljudfiler av typen mp3, wav, ogg eller mpeg är tillåtna",
        )
        .refine(
            (file) => !file || file.size <= MaxFileSize,
            "Filen får inte vara större än 5MB",
        ),
});

export type addDialectWordServer = z.infer<typeof addDialectWordServer>;