import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Server-variabler
     * Dessa är ALDRIG tillgängliga i browsern
     */
    server: {
        DATABASE_URL: z.url(),
        MYSQL_USER: z.string().min(1),
        MYSQL_PASSWORD: z.string().min(1),

        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_BASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        S3_ACCESS_KEY: z.string().min(1),
        S3_SECRET_KEY: z.string().min(1),
        S3_REGION: z.string().min(1),
        S3_BUCKET_NAME: z.string().min(1),
        S3_ENDPOINT: z.string().min(1),
    },

    /*
     * Client-variabler
     * MÅSTE börja med NEXT_PUBLIC_
     */
    client: {
        // NEXT_PUBLIC_API_URL: z.url(),
    },

    /*
     * Här mappar vi process.env
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        MYSQL_USER: process.env.MYSQL_USER,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
        // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_BASE_URL: process.env.BETTER_AUTH_BASE_URL,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
        S3_SECRET_KEY: process.env.S3_SECRET_KEY,
        S3_REGION: process.env.S3_REGION,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_ENDPOINT: process.env.S3_ENDPOINT,
    },

    /*
     * Extra säkerhet: tomma strängar räknas som ogiltiga
     */
    emptyStringAsUndefined: true,
});
