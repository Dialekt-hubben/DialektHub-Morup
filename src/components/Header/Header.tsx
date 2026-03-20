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
                <Image
                    src="/logo.png"
                    alt="DialektHub Logo"
                    width={50}
                    height={50}
                />
                <h1>DialektHub • Dialektlexikon</h1>
            </Link>

            <nav>
                <ul>
                    <li>
                        {userSession ? (
                            <form action={signOut}>
                                <h5>Välkommen,{userSession?.name}</h5>
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
