import db from "@/Drizzle";
import styles from "./page.module.css";
import { dialectWordTable } from "@/Drizzle/models/DialectWord"; 

export default async function Home() {
  const data = await db.select().from(dialectWordTable);
  const dialectWord = JSON.stringify(data);


  let dataObject = data.map(item => ({
    id: item.id,
    word: item.word,
    pronunciation: item.pronunciation,
    phrase: item.phrase,
    status: item.status,
    userId: item.userId,
    nationalWordId: item.nationalWordId,
    soundFileId: item.soundFileId
  }));
  console.log("Filtered Data:", dataObject);
  

  return (    
      <body>
        <div>
          <div className={styles["header"]}></div>
          <div className={styles["db-list"]}>
          {JSON.stringify(dataObject)}
          </div>      
          <div className={styles["footer"]}></div>      
        </div>
      </body>
  );
}