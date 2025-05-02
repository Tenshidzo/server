export default class User {
  static async create(db, { firstName, lastName, email, password }) {
    const result = await db.run(
      `INSERT INTO users (firstName, lastName, email, password) 
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, password]
    );
    return result.lastID;
  }

  static async findByEmail(db, email) {
    return db.get('SELECT * FROM users WHERE email = ?', email);
  }

  static async findById(db, id) {
    return db.get('SELECT * FROM users WHERE id = ?', id);
  }
static async findByEmail(db, email) {
  return db.get('SELECT * FROM users WHERE email = ?', email);
}
}