import Link from "next/link";
import style from "./Footer.module.css";

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={style.footer}>
            <div>
                <h2>Morpekanska</h2>
                <p>Bevara den morpekanska dialekten i ord & ljud.</p>
            </div>
            <div>
                <h2>Om projektet</h2>
                <p>
                    En plattform för att dokumentera och bevara den Morpekanska dialekten för framtida generationer.
                </p>
            </div>
            <div>
                <h2>Kontakt</h2>
                <p>
                    <b>Namn:</b> Håkan Petersson
                    <br />
                    <b>Adress:</b> Sandhavrevägen 8, 311 54, Glommen, Hallands län
                    <br />
                    <b>Email:</b> {" "}
                    <Link href="mailto:hakan@glommen.eu">
                        hakan@glommen.eu 
                    </Link> 
                </p>
            </div>
            <hr />
            <p className={style.copyright}>
                &copy; {currentYear} Morupsakademin - Med kärlek för den Morpekanska
                dialekten.
            </p>
        </footer>
    );
}
export default Footer;
