import 'dotenv/config';
import db from '.';
import { dialectWordTable } from './models/DialectWord';
import { nationalWordTable } from './models/NationalWord';
import { soundFileTable } from './models/SoundFile';
import { account, session, user, verification } from './models/auth-schema';


async function reset() {
  console.log('Resetting database...');
  // Delete tables with foreign keys first
  await db.delete(dialectWordTable);
  await db.delete(session);
  await db.delete(account);
  
  // Delete independent tables
  await db.delete(nationalWordTable);
  await db.delete(soundFileTable);
  await db.delete(verification);
  await db.delete(user);
  console.log('Database reset complete!');
}

async function main() {
  await reset();

  const userData: typeof user.$inferInsert = {
    id: crypto.randomUUID(),
    name: 'John',
    email: 'john@example.com',
    emailVerified: true,
    image: 'http://example.com/john.png'
  };
  const insertedUser = await db.insert(user).values(userData).returning();
  
  const nationalWord: typeof nationalWordTable.$inferInsert = {
    word: 'Fågel',
    description: 'En vanlig fågel'
  }
  const insertednationalWord = await db.insert(nationalWordTable).values(nationalWord).returning();

  const soundFile: typeof soundFileTable.$inferInsert = {
    fileName: 'fagel.mp3',
    url: 'http://example.com/fagel.mp3'
  } 
  const insertedsoundFile = await db.insert(soundFileTable).values(soundFile).returning();
  
  const dialectWord: typeof dialectWordTable.$inferInsert = {
    word: 'Ful',
    phrase: 'En ful ful flyger i luften',
    pronunciation: 'Fuul',
    status: 1,
    userId: insertedUser[0].id,
    nationalWordId: insertednationalWord[0].id,
    soundFileId: insertedsoundFile[0].id,
  }
  await db.insert(dialectWordTable).values(dialectWord);
   
  // console.log(`${user.name} New user created!`)
  // console.log(`${nationalWord.word} New national word created!`)
  // console.log(`${soundFile.fileName} New sound file created!`)
  // console.log(`${dialectWord.word} New dialect word created!`)

  const users = await db.select().from(user);
  const nationalWords = await db.select().from(nationalWordTable);
  const soundFiles= await db.select().from(soundFileTable);
  const dialectWords = await db.select().from(dialectWordTable);

  console.log('All users:', users);
  console.log('All national words:', nationalWords);
  console.log('All sound files:', soundFiles);
  console.log('All dialect words:', dialectWords);

}

main();
