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

export const baseDialectWordSchema = z.object({
    dialectWord: z.string().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().min(1, "Nationellt ord är obligatoriskt"),
});

// TypeScript interface for add word
export const addDialectWordClient = baseDialectWordSchema.extend({
    audioFile: z
        .custom<FileList | File>()
        .nullable()
        .transform((value) => {
            if (value instanceof FileList) {
                return value.length > 0 ? value[0] : null;
            }
            return value || null;
        })
        .refine(
            (file) => !file || AllowedFileTypes.includes(file.type.toLowerCase()),
            "Bara ljudfiler av typen mp3, wav, ogg eller mpeg är tillåtna",
        )
        .refine(
            (file) => !file || file.size <= MaxFileSize,
            "Filen får inte vara större än 5MB",
        ),
});
export type addDialectWordClient = z.infer<typeof addDialectWordClient>;

export const updateDialectWord = baseDialectWordSchema.extend({
    id: z.number(),
    status: Status.default("pending").optional(),
});
export type updateDialectWord = z.infer<typeof updateDialectWord>;
