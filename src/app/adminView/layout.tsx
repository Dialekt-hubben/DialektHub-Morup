
import styles from "./layout.module.css";
import { AdminSidebar } from "@/components/Admin/AdminSidbar";

export default function AdminLayout({ children } : { children: React.ReactNode }) 
{
    return (
        <div className={styles.layoutContainer}>
            <AdminSidebar />
            <div className={styles.contentContainer}>
                    {children}
            </div>
        </div>
    );
}