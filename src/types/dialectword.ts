import { z } from "zod";
// TypeScript interface for the API response
type DialectWordTableResponse = {
    paginationOffset: number,
    page: number,
    paginationSize: number,
    total: number,
    data: Array<{
        id: number,
        word: string,
        pronunciation: string,
        phrase: string,
        status: "pending" | "approved" | "rejected",
        userName: string | null,
        nationalWord: string | null,
        soundFileUrl: string | null,
    }>;
    error?: string,
};

export type { DialectWordTableResponse };

// TypeScript interface for add word 
export const addDialectWord = z.object({
    word: z.string().min(1, "Word is required"),
    pronunciation: z.string().min(1, "Pronunciation is required"),
    audioFile: z
        .file()
        .refine(file => file instanceof File, "Audio file is required")
        .refine(file => file.type.startsWith("audio/"), "File must be an audio file"),
});

export type addDialectWord = z.infer<typeof addDialectWord>;