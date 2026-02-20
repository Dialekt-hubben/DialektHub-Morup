import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Server-variabler
     * Dessa är ALDRIG tillgängliga i browsern
     */
    server: {
        DATABASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
    },

    /*
     * Client-variabler
     * MÅSTE börja med NEXT_PUBLIC_
     */
    client: {
        NEXT_PUBLIC_API_URL: z.url(),
        NEXT_PUBLIC_BETTER_AUTH: z.string().min(1),
    },

    /*
     * Här mappar vi process.env
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BETTER_AUTH: process.env.NEXT_PUBLIC_BETTER_AUTH,
    },

    /*
     * Extra säkerhet: tomma strängar räknas som ogiltiga
     */
    emptyStringAsUndefined: true,
});
