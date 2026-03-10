import Image from "next/image";
import Link from "next/link";
import style from "./Header.module.css";
import { signOut } from "@/actions/auth";

async function Header() {
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
                        <h5>Välkommen</h5>
                        <form action={signOut} method="post">
                            <button type="submit" className="btn secondary">
                                Logga ut
                            </button>
                        </form>
                        <Link href="/login" className="btn primary">
                            Login
                        </Link>
                        <Link href="/signup" className="btn">
                            Sign Up
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
export default Header;
