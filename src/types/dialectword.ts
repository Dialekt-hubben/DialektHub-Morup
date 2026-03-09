import { z } from "zod";

export const Status = z.enum(["pending", "approved", "rejected"]);

export type Status = z.infer<typeof Status>;

export const DialectWordTableResponse = z.object({
    id: z.number(),
    word: z.string(),
    pronunciation: z.string().nullable(),
    phrase: z.string().nullable(),
    status: Status,
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
