import { mysqlTable, text, int } from "drizzle-orm/mysql-core";

export const soundFileTable = mysqlTable("sound_file_table", {
    id: int("id").primaryKey().autoincrement(),
    fileName: text("file_name").notNull(),
});
