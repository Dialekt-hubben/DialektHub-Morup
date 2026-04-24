"use client";

import { usePathname } from "next/navigation";
import styles from "../../app/adminView/layout.module.css";

export function AdminSidebar() {

    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
                <nav className={styles.navContainer} >
                    <ul>
                        <li className={`${styles.navItem} ${pathname === "/adminView" ? styles.active : ""}`}><a href="/adminView">Dashboard</a></li>
                        <li className={`${styles.navItem} ${pathname === "/adminView/importExcel" ? styles.active : ""}`}><a href="/adminView/importExcel">Import Excel</a></li>
                        <li className={`${styles.navItem} ${pathname === "/adminView/userRoles" ? styles.active : ""}`}><a href="/adminView/userRoles">Change User Roles</a></li>
                    </ul>
                </nav>
            </aside>
    )
}
