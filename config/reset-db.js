import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

async function reset() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, '../law-citizen.db');

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Сбрасываем БД:', dbPath);
  await db.exec(`
    DROP TABLE IF EXISTS violations;
    DROP TABLE IF EXISTS users;
  `);
  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      imageUrl TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      userId INTEGER,
      latitude REAL,
      longitude REAL,
      isSynced BOOLEAN DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  console.log('БД успешно сброшена и пересоздана');
  await db.close();
}

reset().catch(err => {
  console.error('Ошибка сброса БД:', err);
  process.exit(1);
});