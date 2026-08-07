import Image from "next/image";
import Link from "next/link";
import style from "./Header.module.css";
import { signOut } from "@/actions/auth";
import { getInactiveUserSession } from "@/lib/auth";

async function Header() {
    const userSession = await getInactiveUserSession();

    return (
        <header className={style.header}>
            <Link href="/" className={style.logo}>
                <Image src="/logo.svg" alt="Morpekanska Logo" width={90} height={90} />
                <h1>Mårpeakademiens Orlesta</h1>
            </Link>

            <nav>
                <ul>
                    <li>
                        {userSession ? (
                            <form action={signOut}>
                                <h5>Välkommen, {userSession?.name}</h5>
                                <button type="submit" className="btn secondary">
                                    Logga ut
                                </button>
                            </form>
                        ) : (
                            <div>
                                <Link href="/login" className="btn primary">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}
export default Header;
