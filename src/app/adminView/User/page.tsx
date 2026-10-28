import styles from "./page.module.css";

import { InputGroup } from "@/components/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog } from "@fortawesome/free-solid-svg-icons";
import { Table, TableCell, TableRow } from "@/components/Table";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { deleteUser, getUsers } from "@/actions/auth";
import z from "zod";
import { AuthUser } from "@/types/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ConfirmUserDeletionDialog from "@/components/Admin/ConfirmUserDeletionDialog";
import { UserSignupButton } from "@/components/Admin/UserSignupButton";
import { translateRoleToSwedish } from "@/utils/role";

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
    let totalCount = 0;
    let page = 1;

    if (parsedParams.success) {
        page = (await parsedParams?.data.searchParams)?.page;
        const query = (await parsedParams?.data.searchParams)?.query;

        users = (await getUsers(10, (page - 1) * 10, query)).users;
        totalCount = Math.ceil(
            (await getUsers(10, (page - 1) * 10, query)).totalCount / 10,
        );
    }

    console.log({ users });

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
                        <UserSignupButton />
                    </div>
                }>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Link
                                className={styles.emailColumn}
                                href={`mailto:${user.email}`}>
                                {user.email}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <span
                                className={`btn ${user.role === "admin" ? "primary" : ""}`}>
                                {translateRoleToSwedish(user.role)}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span
                                className={`btn ${!user.mustChangePassword ? "primary" : ""}`}>
                                {!user.mustChangePassword ? "Active" : "Inbjuden"}
                            </span>
                        </TableCell>
                        <TableCell>
                            {formatDate.format(new Date(user.createdAt))}
                        </TableCell>
                        <TableCell className={styles.actions}>
                            <button>
                                <span>Redigera användare</span>
                                <FontAwesomeIcon size="xl" icon={faUserCog} />
                            </button>
                            {session && session.user.id !== user.id && (
                                <ConfirmUserDeletionDialog
                                    user={user}
                                    handleDeleteUser={deleteUser}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
            <Pagination page={page} totalPages={totalCount} />
        </main>
    );
}

export default Page;
