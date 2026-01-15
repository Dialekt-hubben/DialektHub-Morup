import { signOut } from "@/actions/auth";
import { getActiveUserSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getActiveUserSession();
  
  return (
    <main>
      <h1>Hej {session.name}</h1>
      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
    </main>);
}