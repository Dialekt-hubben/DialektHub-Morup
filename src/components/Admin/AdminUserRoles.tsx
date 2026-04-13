"use client";

import { searchUsersByEmail, updateUserRole } from "@/actions/auth";
import { UserRole } from "@/types/auth";
import { SubmitEvent, useState } from "react";
import styles from "./AdminUserRoles.module.css";

type RoleUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

export default function AdminUserRoles() {
    const [emailQuery, setEmailQuery] = useState("");
    const [users, setUsers] = useState<RoleUser[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    
    // Handle search functionality based on email.
    const handleSearch = async ( event: SubmitEvent<HTMLFormElement> ) => {
        event.preventDefault();
        const normalizedQuery = emailQuery.trim();

        // If the search field is empty, clear the user list and reset search status.
        if (!normalizedQuery) {
            setUsers([]);
            setHasSearched(false);
            return;
        }

        // Perform the search and handle loading state
        setIsSearching(true);
        try {
            const result = await searchUsersByEmail(normalizedQuery);
            setUsers(result);
            setHasSearched(true);
            setStatusMessage("");
            setStatusType(null);
        } catch {
            setStatusType("error");
            setStatusMessage("Kunde inte söka efter användare.");
        } finally {
            setIsSearching(false);
        }
    };

    // Handle updating of user's role and manage UI state during the update process.
    const handleRoleSave = async (userId: string, role: UserRole) => {
        setActiveUserId(userId);
        try {
            await updateUserRole({ userId, role });
            setEmailQuery("");
            setUsers([]);
            setHasSearched(false);
            setStatusType("success");
            setStatusMessage(`Rollen uppdaterades till ${role}.`);
        } catch {
            setStatusType("error");
            setStatusMessage("Kunde inte spara rolländringen.");
        } finally {
            setActiveUserId(null);
        }
    };

    return (
        <section className={styles.card}>
            <h2>Rollhantering</h2>
            <hr />

            {/* Search form for finding users based on email */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                    type="search"
                    name="userEmail"
                    value={emailQuery}
                    onChange={(event) => setEmailQuery(event.target.value)}
                    className={styles.searchInput}
                    placeholder="Sök användare via e-post"
                    aria-label="Sök användare via e-post"
                />
                <button type="submit" className="btn primary" disabled={isSearching}>
                    {isSearching ? "Söker..." : "Sök"}
                </button>
            </form>

            {/* Statusmessage for role updates */}
            {statusType && ( 
                <p className={ statusType === "success" ? styles.statusSuccess : styles.statusError }
                    role="status"
                    aria-live="polite">                     
                    {statusMessage}
                </p>
            )}

            {/* List users with their current role and a form to update it. */}
            {!hasSearched ? (
                <p>Ändra en roll för en användare på sidan.</p>
            ) : users.length === 0 ? (
                <p>Ingen användare hittades för den e-posten.</p>
            ) : (
                <ul className={styles.userList}>
                    {users.map((currentUser) => (
                        <li key={currentUser.id} className={styles.userRow}>
                            <div>
                                <p className={styles.userName}>{currentUser.name}</p>
                                <p className={styles.userEmail}>{currentUser.email}</p>
                            </div>

                            {/* Role form */}
                            <form
                                className={styles.roleForm}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const formData = new FormData(event.currentTarget);
                                    const roleFromForm = formData.get("role");

                                    if (
                                        roleFromForm !== UserRole.enum.user &&
                                        roleFromForm !== UserRole.enum.admin
                                    ) {
                                        return;
                                    }
                                    
                                    handleRoleSave(currentUser.id, roleFromForm);
                                }}>
                                
                                {/* Dropdown-meny */}
                                <select
                                    name="role"
                                    defaultValue={currentUser.role}
                                    className={styles.roleSelect}
                                    aria-label={`Välj roll för ${currentUser.email}`}
                                    disabled={activeUserId === currentUser.id}>
                                    <option value={UserRole.enum.user}>user</option>
                                    <option value={UserRole.enum.admin}>admin</option>
                                </select>

                                {/* Save button */}
                                <button
                                    type="submit"
                                    className="btn primary"
                                    disabled={activeUserId === currentUser.id}>
                                    {activeUserId === currentUser.id
                                        ? "Sparar..."
                                        : "Spara"}
                                </button>

                            </form>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
