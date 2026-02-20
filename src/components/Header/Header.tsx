import Image from "next/image";
import Link from "next/link";
import style from "./Header.module.css";

function Header() {
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
                        <Link href="/login" className="btn primary">
                            Login
                        </Link>
                    </li>
                    <li>
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
