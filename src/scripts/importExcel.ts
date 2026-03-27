import * as XLSX from "xlsx";
import db from "../Drizzle";
import { dialectWordTable } from "../Drizzle/models/DialectWord";
import { soundFileTable } from "../Drizzle/models/SoundFile";
import { nationalWordTable } from "../Drizzle/models/NationalWord";
import { user } from "../Drizzle/models/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Signup } from "@/types/auth";

/*
### OBS VIKTIGT! Läs in en kopia och inte den ursprungliga Excel-filen eftersom den kommer att modifieras under körning. ###

Denna fil är ett engångsskript som används för att importera ord från en Excel-fil till databasen.
- Den läser in en specifik flik i Excel-filen,
- Validerar varje rad och importerar giltiga rader till databasen.
Rader som inte uppfyller valideringskriterierna loggas och hoppas över.
Efter importen töms de importerade raderna i Excel-filen för att undvika dubbletter vid framtida körningar av skriptet.
De rader som inte imorterades på grund av valideringsfel lämnas kvar i Excel-filen så att de kan granskas och korrigeras manuellt.
*/

type Row = {
    Dialekt: string;
    Svenska: string;
};

const EXCEL_FILE_PATH = "ordlista1.xlsx";
const EXCEL_SHEET_INDEX = 8; // Fliken på Excel-sidan.
const INVALID_CHARACTER_REGEX = /[ \[,\(0-9]/;

class ExcelUser {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    constructor(
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }
}

class ExcelSuperClass {
    FilePath: string;
    PageNumber: number;
    Workbook: XLSX.WorkBook;
    Page: XLSX.WorkSheet;

    constructor(filePath: string, pageNumber: number) {
        this.FilePath = filePath;
        this.PageNumber = pageNumber;
        this.Workbook = XLSX.readFile(filePath);
        const pageName = this.Workbook.SheetNames[pageNumber];

        if (!pageName) {
            throw new Error(
                `Worksheet with index ${pageNumber} was not found.`,
            );
        }

        this.Page = this.Workbook.Sheets[pageName];
    }

    private SaveWorkbook() {
        XLSX.writeFile(this.Workbook, this.FilePath);
    }

    public GetRows() {
        const rows = XLSX.utils.sheet_to_json(this.Page, {
            header: ["Dialekt", "Svenska"], // Vi specificerar headern så att vi får rätt nycklar i objektet
            blankrows: false, // Vi vill inte ha med tomma rader
            skipHidden: true, // Vi vill inte ha med dolda rader
        }) as Row[];

        rows.shift(); // Ta bort den första raden som är headern i Excel-filen

        return rows; // Ta bort headern som vi lade till i GetRows och returnera den. Nu har vi bara raderna med data kvar.
    }

    public AddToRow(row: Row) {
        XLSX.utils.sheet_add_json(this.Page, [row], {
            skipHeader: true,
            origin: -1,
        });
        this.SaveWorkbook();
    }
    public UpdateRow(index: number, row: Row) {
        XLSX.utils.sheet_add_json(this.Page, [row], {
            skipHeader: true,
            origin: index + 1, // +1 eftersom headern är på index 0
        });
        this.SaveWorkbook();
    }
    public RemoveRow(index: number) {
        XLSX.utils.sheet_add_json(this.Page, [{ Dialekt: "", Svenska: "" }], {
            skipHeader: true,
            origin: index + 1, // +1 eftersom headern är på index 0
        });
        this.SaveWorkbook();
    }
}

function shouldSkipRow(row: Row) {
    const dialectWord = row.Dialekt.toString().trim();
    const nationalWord = row.Svenska.toString().trim();

    if (!dialectWord || !nationalWord) {
        return {
            skip: true,
            reason: "Row has empty values",
            dialectWord,
            nationalWord,
        };
    }

    if (
        INVALID_CHARACTER_REGEX.test(dialectWord) ||
        INVALID_CHARACTER_REGEX.test(nationalWord)
    ) {
        return {
            skip: true,
            reason: "Row has invalid characters or format",
            dialectWord,
            nationalWord,
        };
    }

    return {
        skip: false,
        dialectWord,
        nationalWord,
    };
}

// Hämta eller skapa nationellt ord
async function getOrCreateNationalWord(word: string) {
    const existing = await db
        .select()
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word))
        .limit(1);
    if (existing.length > 0) {
        return existing[0].id;
    }

    await db.insert(nationalWordTable).values({ word });

    const created = await db
        .select()
        .from(nationalWordTable)
        .where(eq(nationalWordTable.word, word))
        .limit(1);
    return created[0].id;
}

// Hämta eller skapa soundfile för ett ord
async function getOrCreateSoundFile(fileName: string) {
    const existing = await db
        .select()
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName))
        .limit(1);
    if (existing.length > 0) return existing[0].id;

    await db.insert(soundFileTable).values({
        fileName,
        url: `s3data/soundfiles/${fileName}`,
    });

    const created = await db
        .select()
        .from(soundFileTable)
        .where(eq(soundFileTable.fileName, fileName))
        .limit(1);
    return created[0].id;
}

async function getUserIdByName(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
) {
    const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.name, name))
        .limit(1);

    if (result.length > 0) {
        return result[0].id;
    } else {
        const createUser = {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
        } satisfies Signup;
        const result = await auth.api.signUpEmail({
            body: createUser,
        });
        return result.user.id;
    }
}

async function importWords() {
    const excel = new ExcelSuperClass(EXCEL_FILE_PATH, EXCEL_SHEET_INDEX);
    const rows = excel.GetRows();
    let skippedRows = 0;

    // Skapa en användare som ska kopplas till de importerade orden
    // name, email, password och confirmPassword
    const excelUser = new ExcelUser(
        "Håkan Petersson",
        "hakan@glommen.eu",
        "adminadmin",
        "adminadmin",
    );

    const userId = await getUserIdByName(
        excelUser.name,
        excelUser.email,
        excelUser.password,
        excelUser.confirmPassword,
    );

    // Loopa igenom raderna och importera dem till databasen
    for (const [index, row] of rows.entries()) {
        const { skip, reason, dialectWord, nationalWord } = shouldSkipRow(row);

        // Om raden inte är giltig, logga anledningen och fortsätt.
        if (skip) {
            console.log("[-] Skipping", { reason, row }, "\n");
            skippedRows++;
            continue;
        } else {
            console.log("[+] Adding", { row });
        }

        // Skapa ett nytt dialektord i databasent med referenser till nationalordet och ljudfilen
        await db.insert(dialectWordTable).values({
            word: dialectWord,
            status: Math.floor(Math.random() * 3), // add random status between 0 and 2
            userId,
            nationalWordId: await getOrCreateNationalWord(nationalWord),
            soundFileId: await getOrCreateSoundFile(`${dialectWord}.mp3`),
        });

        // Töm raden i Excel först efter lyckad insert i databasen.
        excel.RemoveRow(index);
    }
    console.log("\nImport klar!");
    console.log("--------------------------------------------------");
    console.log(`Antal skippade rader: ${skippedRows}`);
    console.log(`Antal bearbetade rader: ${rows.length - skippedRows}`);
    console.log("--------------------------------------------------");
}

importWords();
