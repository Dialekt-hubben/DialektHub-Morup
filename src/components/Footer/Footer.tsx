import Link from "next/link";
import style from "./Footer.module.css";

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={style.footer}>
            <div>
                <h2>Mårpekanska</h2>
                <p>Bevara den mårpekanska dialekten i ord & ljud.</p>
            </div>
            <div>
                <h2>Om projektet</h2>
                <p>
                    En plattform för att dokumentera och bevara den Mårpekanska dialekten
                    för framtida generationer.
                </p>
            </div>
            <div>
                <h2>Kontakt</h2>
                <p>
                    <b>Namn:</b> Håkan Petersson
                    <br />
                    <b>Adress:</b> Sandhavrevägen 8, 311 54, Glommen, Hallands län
                    <br />
                    <b>Email:</b>{" "}
                    <Link href="mailto:hakan@glommen.eu">hakan@glommen.eu</Link>
                </p>
            </div>
            <hr />
            <p className={style.copyright}>
                &copy; {currentYear} Mårpeakademien - Det ligaste vi hann.
            </p>
        </footer>
    );
}
export default Footer;
