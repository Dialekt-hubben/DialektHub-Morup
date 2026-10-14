"use client";

import { AuthUser } from "@/types/auth";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import styles from "@/app/adminView/User/page.module.css";
import { translateRoleToSwedish } from "@/utils/role";

type User = Omit<AuthUser, "image" | "emailVerified" | "name">;

function ConfirmUserDeletionDialog({
    user,
    handleDeleteUser,
}: {
    user: User;
    handleDeleteUser: (formdata: FormData) => Promise<void>;
}) {
    const dialog = useRef<HTMLDialogElement>(null);

    const toggleDialog = () => {
        if (dialog.current) {
            if (dialog.current.open) {
                dialog.current.close();
            } else {
                dialog.current.showModal();
            }
        }
    };

    return (
        <>
            <button onClick={toggleDialog}>
                <span>Ta bort användare</span>
                <FontAwesomeIcon size="xl" icon={faTrashCan} />
            </button>
            <dialog ref={dialog} className="confirmUserDeletionDialog">
                <h2>Bekräfta borttagning av användare</h2>
                <ul>
                    <li>
                        <strong>Email:</strong> {user.email}
                    </li>
                    <li>
                        <strong>Role:</strong> {translateRoleToSwedish(user.role)}
                    </li>
                </ul>
                <p>
                    Denna åtgärd är oåterkallelig. All data associerad med användaren
                    kommer att tas bort permanent.
                </p>
                <div className={styles.dialogActions}>
                    <form
                        action={(data) => {
                            handleDeleteUser(data);
                            toggleDialog();
                        }}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button className="btn primary" type="submit">
                            Ta bort användare
                        </button>
                    </form>
                    <button className="btn" onClick={toggleDialog}>
                        Avbryt
                    </button>
                </div>
            </dialog>
        </>
    );
}

export default ConfirmUserDeletionDialog;
