import z from "zod";

const MaxFileSize = 5 * 1024 * 1024; // 5MB
const AllowedFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];

export const dialectWordApi = z.object({
    word: z.string().min(1, "Dialekt ord är obligatoriskt"),
    pronunciation: z.string().min(1, "Uttal är obligatoriskt"),
    audioFile: z
        .instanceof(File)
        .optional()
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

export type DialectWordApi = z.infer<typeof dialectWordApi>;
