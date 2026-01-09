import db from "@/Drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  // "nextCookies" is always need to be lasted last in the plugins array
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
});