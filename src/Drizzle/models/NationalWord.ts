import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const nationalWordTable = mysqlTable("national_word_table", {
    id: int("id").primaryKey().autoincrement(),
    word: varchar("word", { length: 255 }).unique().notNull(),
});
