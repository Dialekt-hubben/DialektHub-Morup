import { InputGroup } from "@/components/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import { getAdminSession } from "@/lib/auth";

async function Page() {
    await getAdminSession();

    return (
        <main>
            <form>
                <InputGroup label="Sök" placeholder="Sök på email..." />
                <button className="btn primary">Sök</button>
            </form>

            <button className="btn primary">Lägg till användare</button>

            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Roll</th>
                        <th>Status</th>
                        <th>Skapad</th>
                        <th>Åtgärder</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <a href="mailto:user@example.com">user@example.com</a>
                        </td>
                        <td>Admin</td>
                        <td>Active</td>
                        <td>1 maj 2023</td>
                        <td>
                            {/* 
                                Remember to add size for the icons, otherwise they will be
                                not visible 
                            */}
                            <button>
                                <span className="sr-only">Redigera</span>
                                <FontAwesomeIcon icon={faUserCog} />
                            </button>
                            <button>
                                <span className="sr-only">Ta bort</span>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <Pagination page={3} totalPages={5} />
        </main>
    );
}

export default Page;
