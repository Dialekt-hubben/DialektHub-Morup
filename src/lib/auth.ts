import db from "@/Drizzle";
import { AuthUser } from "@/types/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // "nextCookies" is always need to be placed last in the plugins array
  plugins: [nextCookies()],
});

/**
 * Retrieves the currently active user session from the server-side context.
 *
 * This function attempts to fetch the current session using the request headers.
 * If a valid session with a user object is found, it returns the user object.
 * If no session or user is found, it automatically redirects the client to the `/login` page.
 *
 * @returns {Promise<object>} A promise that resolves to the authenticated user object.
 * @throws {never} This function does not throw but will interrupt execution via a redirect if authentication fails.
 */
export async function getActiveUserSession(): Promise<AuthUser> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If no session, redirect to login
  if (!session?.user) {
    redirect("/login");
  }
  
  return session.user as AuthUser;
}
