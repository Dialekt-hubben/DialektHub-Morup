import { signOut } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If no session, redirect to login
  if (!session?.user) {
    redirect("/Login");
  }
  
  return (
    <main>
      <h1>Hej {session.user.name}</h1>
      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
    </main>);
}