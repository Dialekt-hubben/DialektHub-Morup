import { signOut } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  return (
    <main>
      <h1>Hej {session?.user?.name}</h1>
      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
    </main>);
}