"use client";

import { usePathname } from "next/navigation";
import styles from "../../app/adminView/layout.module.css";
import Link from "next/link";

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.navContainer}>
                <ul>
                    <li
                        className={`${styles.navItem} ${pathname === "/adminView" ? styles.active : ""}`}>
                        <Link href="/adminView">AdminVy</Link>
                    </li>
                    <li
                        className={`${styles.navItem} ${pathname === "/adminView/importExcel" ? styles.active : ""}`}>
                        <Link href="/adminView/importExcel">Importera Excelfil</Link>
                    </li>
                    <li
                        className={`${styles.navItem} ${pathname === "/adminView/User" ? styles.active : ""}`}>
                        <Link href="/adminView/User">Användare</Link>
                    </li>
                    {/* <li
                        className={`${styles.navItem} ${pathname === "/adminView/signup" ? styles.active : ""}`}>
                        <a href="/adminView/signup">Skapa ny användare</a>
                    </li>
                    <li
                        className={`${styles.navItem} ${pathname === "/adminView/userRoles" ? styles.active : ""}`}>
                        <a href="/adminView/userRoles">Ändra användarroller</a>
                    </li> */}
                </ul>
            </nav>
        </aside>
    );
}
