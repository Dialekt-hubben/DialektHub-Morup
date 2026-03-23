import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as authSchema from "./models/auth-schema";
import * as dialectWord from "./models/DialectWord";
import * as nationalWord from "./models/NationalWord";
import * as soundFile from "./models/SoundFile";
import { env } from "@/env";

const schema = {
    ...authSchema,
    ...dialectWord,
    ...nationalWord,
    ...soundFile,
};

export const connection = mysql.createPool(env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

export default db;
