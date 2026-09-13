import styles from "./page.module.css";

import { InputGroup } from "@/components/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Table, TableCell, TableRow } from "@/components/Table";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { deleteUser, getUsers } from "@/actions/auth";
import z from "zod";
import { AuthUser, UserRole } from "@/types/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ConfirmUserDeletionDialog from "@/components/Admin/ConfirmUserDeletionDialog";

const Params = z.object({
    searchParams: z.promise(
        z.object({
            page: z.coerce.number().int().nonnegative().default(1),
            query: z.string().optional(),
        }),
    ),
});

type Params = z.infer<typeof Params>;
type User = Omit<AuthUser, "image" | "emailVerified" | "name">;

const formatDate = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
});

async function Page(params: Params) {
    const parsedParams = await Params.safeParseAsync(params);
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    let users: User[] = [];
    let page = 1;

    if (parsedParams.success) {
        page = (await parsedParams?.data.searchParams)?.page;
        users = await getUsers(10, (page - 1) * 10);
    }

    const isActive = (user: User) => {
        const createdAt = formatDate.format(user.createdAt);
        const updatedAt = formatDate.format(user.updatedAt);

        return createdAt !== updatedAt;
    };

    const handleDeleteUser = async (formdata: FormData) => {
        "use server";
        const userId = formdata.get("userId") as string;
        if (!userId) {
            throw new Error("User ID is required");
        }

        console.log({ userId });

        // await deleteUser(userId);
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
        <main className={styles.main}>
            <Table
                headerColumns={["Email", "Roll", "Status", "Skapad", "Åtgärder"]} // Email, Role, Status, Created, Actions
                title="Användarna"
                actions={
                    <div className={styles.headerActions}>
                        <form>
                            <InputGroup
                                type="search"
                                name="query"
                                placeholder="Sök på email..."
                            />
                            {/* <button className="btn primary">Sök</button> */}
                        </form>

                        <button className="btn primary">Lägg till användare</button>
                    </div>
                }>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Link href={`mailto:${user.email}`}>{user.email}</Link>
                        </TableCell>
                        <TableCell>
                            <span
                                className={`btn ${user.role === "admin" ? "primary" : ""}`}>
                                {translateRole(user.role)}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className={`btn ${isActive(user) ? "primary" : ""}`}>
                                {isActive(user) ? "Active" : "Inbjuden"}
                            </span>
                        </TableCell>
                        <TableCell>{formatDate.format(user.createdAt)}</TableCell>
                        <TableCell className={styles.actions}>
                            <button>
                                <span className="sr-only">Redigera</span>
                                <FontAwesomeIcon size="xl" icon={faUserCog} />
                            </button>
                            {session && session.user.id !== user.id && (
                                <ConfirmUserDeletionDialog
                                    user={user}
                                    handleDeleteUser={handleDeleteUser}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
            <Pagination page={page} totalPages={users.length / 10} />
        </main>
    );
}

export default Page;
