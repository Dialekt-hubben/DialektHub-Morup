import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from "./models/auth-schema";
import * as dialectWord from "./models/DialectWord";
import * as nationalWord from "./models/NationalWord";
import * as soundFile from "./models/SoundFile";

const schema = {
    ...authSchema,
    ...dialectWord,
    ...nationalWord,
    ...soundFile,
};

const db = drizzle(process.env.DB_FILE_NAME!, { schema });

export default db;
