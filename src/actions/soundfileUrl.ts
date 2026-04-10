"use server";

// Genererar presignerade URL:er för ljudfiler som finns i S3-bucketen.
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3Client";

export async function generateS3Urls(filenames: string[]) {
    const urls: Record<string, string> = {};

    for (const filename of filenames) {
        try {
            const command = new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: `${filename}`,
            });
            // Presignerad URL gäller i 1 timme
            urls[filename] = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (error) {
            console.error(`Failed to generate URL for ${filename}:`, error);
        }
    }

    return urls;
}