import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
