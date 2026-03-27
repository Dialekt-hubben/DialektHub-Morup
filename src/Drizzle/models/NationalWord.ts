import { mysqlTable, text, int } from "drizzle-orm/mysql-core";

export const nationalWordTable = mysqlTable("national_word_table", {
    id: int("id").primaryKey().autoincrement(),
    word: text("word").unique().notNull(),
    description: text("description"),
});
