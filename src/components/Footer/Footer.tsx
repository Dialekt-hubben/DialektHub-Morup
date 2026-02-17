import Link from "next/link";
import style from "./Footer.module.css";

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={style.footer}>
            <div>
                <h2>DialektHub</h2>
                <p>Bevara dialekt i ord & ljud</p>
            </div>
            <div>
                <h2>Om projektet</h2>
                <p>
                    En plattform för att dokumentera och bevara svenska
                    dialekter för framtida generationer.
                </p>
            </div>
            <div>
                <h2>Kontakt</h2>
                <p>
                    Hjälp till att bygga det största dialektlexikonet! Email:{" "}
                    <Link href="mailto:kontakt@dialekthub.se">
                        kontakt@dialekthub.se
                    </Link>
                </p>
            </div>
            <hr />
            <p className={style.copyright}>
                &copy; {currentYear} DialektHub. Med kärlek för svenska
                dialekter.
            </p>
        </footer>
    );
}
export default Footer;
