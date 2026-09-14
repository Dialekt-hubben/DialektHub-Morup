"use client";

import { AuthUser, UserRole } from "@/types/auth";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

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

    const translateRole = (role: UserRole) => {
        switch (role) {
            case "admin":
                return "Admin";
            case "user":
                return "Användare";
            default:
                return role;
        }
    };
    return (
        <>
            <button onClick={toggleDialog}>
                <span className="sr-only">Ta bort</span>
                <FontAwesomeIcon size="xl" icon={faTrashCan} />
            </button>
            <dialog ref={dialog}>
                <h2>Bekräfta borttagning av användare</h2>
                <ul>
                    <li>
                        <strong>Email:</strong> {user.email}
                    </li>
                    <li>
                        <strong>Role:</strong> {translateRole(user.role)}
                    </li>
                </ul>
                <p>
                    Denna åtgärd är oåterkallelig. All data associerad med användaren
                    kommer att tas bort permanent.
                </p>
                <div>
                    <form
                        action={(data) => {
                            handleDeleteUser(data);
                            toggleDialog();
                        }}
                        method="dialog">
                        <input type="hidden" name="userId" value={user.id} />
                        <button className="btn primary" type="submit">
                            Bekräfta
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
