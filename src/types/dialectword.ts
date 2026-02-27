import { z } from "zod";
// TypeScript interface for the API response

export const DialectWordTableResponse = z.object({
    id: z.number(),
    word: z.string(),
    pronunciation: z.string(),
    phrase: z.string(),
    status: z.enum(["pending", "approved", "rejected"]),
    userName: z.string().nullable(),
    nationalWord: z.string().nullable(),
    soundFileUrl: z.string().nullable(),
});

export type DialectWordTableResponse = z.infer<typeof DialectWordTableResponse>;

// TypeScript interface for add word
const MaxFileSize = 5 * 1024 * 1024; // 5MB
const AllowedFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];
export const addDialectWord = z.object({
    word: z.string().min(1, "Word is required"),
    pronunciation: z.string().min(1, "Pronunciation is required"),
    audioFile: z.any().optional(),
});

export type addDialectWord = z.infer<typeof addDialectWord>;
