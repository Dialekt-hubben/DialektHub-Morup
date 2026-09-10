import { InputGroup } from "@/components/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Table, TableCell, TableRow } from "@/components/Table";

function Page() {
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
                <TableRow>
                    <TableCell>
                        <a href="mailto:user@example.com">user@example.com</a>
                    </TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>1 maj 2023</TableCell>
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
            </Table>
        </main>
    );
}

export default Page;
