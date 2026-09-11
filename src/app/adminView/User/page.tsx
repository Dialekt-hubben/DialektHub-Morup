import { InputGroup } from "@/components/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Table, TableCell, TableRow } from "@/components/Table";
import Pagination from "@/components/Pagination";
import { InferSelectModel } from "drizzle-orm";
import { user } from "@/Drizzle/models/auth-schema";
import Link from "next/link";

type params = {
    searchParams: Promise<{
        page: string;
    }>;
};
type User = InferSelectModel<typeof user>;

async function Page({ searchParams }: params) {
    const { page = "1" } = await searchParams;

    const date = new Date();
    const dateForTomorrow = new Date(date);
    dateForTomorrow.setDate(dateForTomorrow.getDate() + 1);

    const formatDate = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    const users = [
        {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            emailVerified: false,
            image: null,
            role: "admin",
            createdAt: date,
            updatedAt: date,
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            emailVerified: true,
            image: null,
            role: "user",
            createdAt: date,
            updatedAt: dateForTomorrow, // Simulate an active user by setting updatedAt to tomorrow
        },
    ] satisfies User[];

    const isActive = (user: User) => {
        const createdAt = formatDate.format(user.createdAt);
        const updatedAt = formatDate.format(user.updatedAt);

        return createdAt !== updatedAt;
    };

    const translateRole = (role: string) => {
        switch (role) {
            case "admin":
                return "Administratör";
            case "user":
                return "Användare";
            default:
                return role;
        }
    };

    return (
        <main>
            <Table
                headerColumns={["Email", "Roll", "Status", "Skapad", "Åtgärder"]}
                title="Användarna"
                actions={
                    <>
                        <form>
                            <InputGroup label="Sök" placeholder="Sök på email..." />
                            <button className="btn primary">Sök</button>
                        </form>

                        <button className="btn primary">Lägg till användare</button>
                    </>
                }>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Link href={`mailto:${user.email}`}>{user.email}</Link>
                        </TableCell>
                        <TableCell>{translateRole(user.role)}</TableCell>
                        <TableCell>{isActive(user) ? "Active" : "Inactive"}</TableCell>
                        <TableCell>{formatDate.format(user.createdAt)}</TableCell>
                        <TableCell>
                            <button>
                                <span className="sr-only">Redigera</span>
                                <FontAwesomeIcon icon={faUserCog} />
                            </button>
                            <button>
                                <span className="sr-only">Ta bort</span>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
            <Pagination page={+page} totalPages={users.length / 10} />
        </main>
    );
}

export default Page;
