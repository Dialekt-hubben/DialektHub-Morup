import z from "zod";
import {
    AllowedFileTypes,
    MaxFileSize,
} from "./DialektFormValidation/audioFileConstraints";

// isFileList makes sure that the value is a FileList, not a single File
const isFileList = (value: File | FileList): value is FileList => {
    return typeof FileList !== "undefined" && value instanceof FileList;
};

export type editWordForm = {
    id: number;
    dialectWord: string;
    nationalWord: string;
    audioFile?: File | FileList | null;
};

export const editWordFormSchema = z.object({
    id: z.number(),
    dialectWord: z.string().trim().min(1, "Dialekt ord är obligatoriskt"),
    nationalWord: z.string().trim().min(1, "Nationellt ord är obligatoriskt"),
    audioFile: z
        .custom<File | FileList | null>()
        .nullable()
        .optional()
        .refine((value) => {
            if (!value) {
                return true;
            }

            if (value instanceof File) {
                return (
                    AllowedFileTypes.includes(value.type.toLowerCase()) &&
                    value.size <= MaxFileSize
                );
            }

            // If the value is a FileList, check the first file in the list
            if (isFileList(value)) {
                const file = value.item(0);
                return (
                    !file ||
                    (AllowedFileTypes.includes(file.type.toLowerCase()) &&
                        file.size <= MaxFileSize)
                );
            }

            return false;
        }, "Bara ljudfiler av typen mp3, wav, ogg eller mpeg är tillåtna"),
});
