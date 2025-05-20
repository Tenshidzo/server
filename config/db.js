import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await open({
  filename: path.join(__dirname, '../law-citizen.db'),
  driver: sqlite3.Database
});
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    image TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    latitude REAL,
    longitude REAL,
    isSynced BOOLEAN DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

console.log('\x1b[36m', '=== ДАННЫЕ ИЗ БАЗЫ ДАННЫХ ===');

try {
  const users = await db.all('SELECT * FROM users');
  console.log('\x1b[33m', 'Пользователи:');
  console.table(users);
  const violations = await db.all('SELECT * FROM violations');
  console.log('\x1b[33m', 'Правопорушення:');
  console.table(violations);
  console.log('\x1b[32m', `Всего пользователей: ${users.length}`);
  console.log('\x1b[32m', `Всего нарушений: ${violations.length}`);

} catch (error) {
  console.error('\x1b[31m', 'Ошибка чтения данных:', error.message);
}

console.log('\x1b[0m'); 

export default db;