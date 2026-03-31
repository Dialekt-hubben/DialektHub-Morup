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

export const connection = mysql.createPool({
    host: env.MYSQL_HOST,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    pool: {
        min: 2,
        max: 10,
    },
});
const db = drizzle(connection, { schema, mode: "default" });

export default db;
