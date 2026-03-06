import * as XLSX from "xlsx";
import db from "../Drizzle";
import { dialectWordTable } from "../Drizzle/models/DialectWord";
import { soundFileTable } from "../Drizzle/models/SoundFile";
import { nationalWordTable } from "../Drizzle/models/NationalWord";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Signup } from "@/types/auth";

type Row = {
    Dialekt: string;
    Svenska: string;
};

const pageToRead = 9; // Liken på Excel-sidan.

const excelfile = XLSX.readFile("ordlista1.xlsx");
const pageName = excelfile.SheetNames[pageToRead];
const page = excelfile.Sheets[pageName];
const rows = XLSX.utils.sheet_to_json(page, {
    header: ["Dialekt", "Svenska"], // Vi specificerar headern så att vi får rätt nycklar i objektet
    blankrows: false, // Vi vill inte ha med tomma rader
}) as Row[];

class ExcelSuperClass {
    FilePath: string;
    PageNumber: number;
    Page: XLSX.WorkSheet;

    constructor(filePath: string, pageNumber: number) {
        this.FilePath = filePath;
        this.PageNumber = pageNumber;
        const excelfile = XLSX.readFile(filePath);
        const pageName = excelfile.SheetNames[pageToRead];
        this.Page = excelfile.Sheets[pageName];
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
        XLSX.writeFile(excelfile, "ordlista1.xlsx");
    }

    public RemoveRow(index: number) {
        XLSX.utils.sheet_add_json(this.Page, [{ Dialekt: "", Svenska: "" }], {
            skipHeader: true,
            origin: index + 1, // +1 eftersom headern är på index 0
        });
        XLSX.writeFile(excelfile, "ordlista1.xlsx");
    }

    public UpdateRow(index: number, row: Row) {
        XLSX.utils.sheet_add_json(this.Page, [row], {
            skipHeader: true,
            origin: index + 1, // +1 eftersom headern är på index 0
        });
        XLSX.writeFile(excelfile, "ordlista1.xlsx");
    }
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

async function importWords() {
    const excel = new ExcelSuperClass("ordlista1.xlsx", 9);
    // Använd befintligt användar-id för Håkan Petersson

    // const newUser = {
    //     name: "Håkan Petersson",
    //     email: "hakan@glommen.eu",
    //     password: "adminadmin",
    //     confirmPassword: "adminadmin",
    // } satisfies Signup;
    // const response = await auth.api.signUpEmail({
    //     body: newUser,
    // });

    // transforma woth regex to check if there are multiple words in either Dialekt or Svenska columns. If there are, skip the row and log it.
    for (const row of excel.GetRows()) {
        const invalidCharacterRegex = new RegExp("[ \\[,\\(]", "g");
        if (!row.Dialekt || !row.Svenska) {
            console.log(
                `Skipping row with empty values ${row.Dialekt} - ${row.Svenska}`,
            );
            continue;
        }
        if (
            row.Dialekt.match(invalidCharacterRegex) ||
            row.Svenska.match(invalidCharacterRegex)
        ) {
            console.log(
                `Skipping row with multiple words ${row.Dialekt} - ${row.Svenska}`,
            );
            continue;
        }

        console.log({ row });
        await db.insert(dialectWordTable).values({
            word: row.Dialekt.trim(), // Vi måste hämta det första ordet om det finns mer än 1 ord.
            phrase: "", // Vi har ingen fras i Excel-filen, så vi sätter den till en tom sträng.
            pronunciation: row.Svenska.trim(), // Vi måste hämta det första ordet om det finns mer än 1 ord.
            status: 1, // 1 för att ordet kommer ifrån Håkan så det är okej.
            userId: "X06v2WLNt3SfxZjW6qkT5GxHWHPIcHrd", // Håkans userId
            nationalWordId: await getOrCreateNationalWord(row.Svenska), // Hämta eller skapa det nationella ordet
            soundFileId: await getOrCreateSoundFile(`${row.Dialekt}.mp3`),
        });
        const index = rows.indexOf(row);
        if (index !== -1) {
            excel.RemoveRow(index);
        }
    }
    console.log("Import klar!");
}
importWords();
