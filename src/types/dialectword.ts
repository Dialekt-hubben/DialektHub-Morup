import { z } from "zod";
// TypeScript interface for the API response
type DialectWordTableResponse = {
    paginationOffset: number;
    page: number;
    paginationSize: number;
    total: number;
    data: Array<{
        id: number;
        word: string;
        pronunciation: string;
        phrase: string;
        status: "pending" | "approved" | "rejected";
        userName: string | null;
        nationalWord: string | null;
        soundFileUrl: string | null;
    }>;
    error?: string;
};

export type { DialectWordTableResponse };

// TypeScript interface for add word
const MaxFileSize = 5 * 1024 * 1024; // 5MB
const AllowedFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];
export const addDialectWord = z.object({
    word: z.string().min(1, "Word is required"),
    pronunciation: z.string().min(1, "Pronunciation is required"),
    audioFile: z.any().optional(),
});

export type addDialectWord = z.infer<typeof addDialectWord>;
