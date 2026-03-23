"use server";
import {
    PutObjectCommand,
    PutObjectCommandInput,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client"; // Din klient ovan
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { env } from "@/env";

export async function handleFileUpload(formData: FormData) {
    const file = formData.get("file") as File;

    // Konvertera filen till en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const params: PutObjectCommandInput = {
        Bucket: env.S3_BUCKET_NAME, // namn på din bucket
        Key: file.name.toLowerCase(), // filnamnet i S3
        Body: buffer, // filens innehåll
        ContentType: file.type, // filens MIME-typ
    };

    await s3Client.send(new PutObjectCommand(params));
}

export async function getFile() {
    const objects: string[] = [];
    const paginator = paginateListObjectsV2(
        { client: s3Client, /* Max items per page */ pageSize: 10 },
        { Bucket: env.S3_BUCKET_NAME },
    );

    for await (const page of paginator) {
        for (const obj of page.Contents ?? []) {
            // Säkerställ att Key finns

            if (!obj.Key) {
                return [];
            }

            const command = new GetObjectCommand({
                Bucket: env.S3_BUCKET_NAME,
                Key: obj.Key,
            });

            const options = { expiresIn: 3600 }; // URL valid for 1 hour

            const url = await getSignedUrl(s3Client, command, options);

            objects.push(url);
        }
    }

    return objects; // Returnerar en platt array av URL:er
}
