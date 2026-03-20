import z from "zod";
import { MaxFileSize, AllowedFileTypes } from "./audioFileConstraints";

export const dialectWordApi = z.object({
    word: z.string().min(1, "Dialekt ord är obligatoriskt"),
    pronunciation: z.string().min(1, "Uttal är obligatoriskt"),
    audioFile: z
        .instanceof(File)
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

export type dialectWordApi = z.infer<typeof dialectWordApi>;
