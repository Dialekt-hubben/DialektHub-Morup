import AdminUserRoles from "@/components/Admin/AdminUserRoles";
import styles from "./page.module.css";

const userRoles = () => {
    return (
        <div className={styles.userRolesContainer}>
            <h1>Användarroller</h1>
            <p>Här kan du ändra användarroller.</p>
            <AdminUserRoles />
        </div>
    );
};

export default userRoles;
