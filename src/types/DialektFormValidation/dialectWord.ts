import { z } from "zod";
import { Status } from "../status";
import { AllowedFileTypes, MaxFileSize } from "./audioFileConstraints";
// TypeScript interface for the API response

export const DialectWordTableResponse = z.object({
    id: z.number(),
    word: z.string(),
    pronunciation: z.string(),
    phrase: z.string(),
    status: Status,
    userName: z.string().nullable(),
    nationalWord: z.string().nullable(),
    soundFileUrl: z.string().nullable(),
});

export type DialectWordTableResponse = z.infer<typeof DialectWordTableResponse>;

// TypeScript interface for add word
export const addDialectWord = z.object({
    word: z.string().min(1, "Dialekt ord är obligatoriskt"),
    pronunciation: z.string().min(1, "Uttal är obligatoriskt"),
    audioFile: z
        .instanceof(FileList)
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
