import { z } from "zod";
import { Status } from "../status";
import { AllowedFileTypes, MaxFileSize } from "./audioFileConstraints";
// TypeScript interface for the API response

export const DialectWordTableResponse = z.object({
    id: z.number(),
    word: z.string(),
    status: Status,
    userName: z.string().nullable(),
    nationalWord: z.string().nullable(),
    fileName: z.string().nullable(),
    soundFileUrl: z.string().nullable().optional(),
});
export type DialectWordTableResponse = z.infer<typeof DialectWordTableResponse>;

// TypeScript interface for add word
export const addDialectWord = z.object({
    dialectWord: z.string().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().min(1, "Nationellt ord är obligatoriskt"),
    audioFile: z
        .custom<FileList>(
            (value) =>
                typeof value !== "undefined" && value instanceof FileList,
            "Förväntat en FileList",
        )
        .nullable()
        .optional()
        .transform((files) => (files && files.length > 0 ? files[0] : null))
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
export type addDialectWord = z.infer<typeof addDialectWord>;

export const updateDialectWord = z.object({
    id: z.number(),
    dialectWord: z.string().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().min(1, "Nationellt ord är obligatoriskt"),
});
export type updateDialectWord = z.infer<typeof updateDialectWord>;
