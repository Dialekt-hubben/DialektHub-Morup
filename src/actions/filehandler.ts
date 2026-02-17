"use server";
import {
    PutObjectCommand,
    GetObjectCommand,
    GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client"; // Din klient ovan
import { file } from "zod";

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        return { success: false };
    }

    // Konvertera filen till en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const key = new URL(`${file.name[0]}/${file.name.toLowerCase()}`);

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME, // namn på din bucket
            Key: key.toString(), // filnamnet i S3
            Body: buffer, // filens innehåll
            ContentType: file.type, // filens MIME-typ
        }),
    );

    return { success: true };
}

// List all files in the S3 bucket.
// export async function getFiles(formData: FormData) {

//     const input = {
//         Bucket: process.env.S3_BUCKET_NAME, // namn på din bucket
//         Key: formData.get("fileName") as string
//     } satisfies GetObjectCommandInput

//     const command = new GetObjectCommand(input);

//     const response = await s3Client.send(command);

//     return { success: true, file: [response] };
// }

// export async function getFiles(fileName: string) {
//     const input = {
//         Bucket: process.env.S3_BUCKET_NAME, // namn på din bucket
//         Key: fileName
//     } satisfies GetObjectCommandInput

//     const command = new GetObjectCommand(input);

//     const response = await s3Client.send(command);

//     const byte = await response.Body?.transformToByteArray();

//     return { success: true, files: [fileName], content: byte };
// }
