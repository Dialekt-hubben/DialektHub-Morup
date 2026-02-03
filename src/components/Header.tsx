import Image from "next/image";
import Link from "next/link";

function Header() {
    return (
        <header>
            <Link href="/">
                <Image src="/logo.png" alt="DialektHub Logo" width={50} height={50} />
                <h1>DialektHub • Dialektlexikon</h1>
            </Link>

            <nav>
                <ul>
                    <li>
                        <Link href="/login" className="btn primary">Login</Link>
                    </li>
                    <li>
                        <Link href="/signup" className="btn">Sign Up</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
export default Header;