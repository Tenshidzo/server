export default class Violation {
  static async create(db, { description, imageUrl, userId, latitude, longitude }) {
    const result = await db.run(
      `INSERT INTO violations 
       (description, imageUrl, userId, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?)`,
      [description, imageUrl, userId, latitude, longitude]
    );
    return result.lastID;
  }
  static async findById(db, id) {
    return db.get('SELECT * FROM violations WHERE id = ?', id);
  }
  static async findByDate(db, { month, year }) {
    return db.all(
      `SELECT * FROM violations 
       WHERE CAST(strftime('%m', date) AS INTEGER) = ?
       AND CAST(strftime('%Y', date) AS INTEGER) = ?`,
      [month, year]
    );
  }
  static async findAll(db, filters) {
    let query = 'SELECT * FROM violations WHERE userId = ?';
    const params = [filters.userId];
    if (filters.date) {
      query += ' AND DATE(date) = ?';
      params.push(filters.date);
    }
    if (filters.latitude && filters.longitude && filters.radius) {
      query += `
        AND (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        ) <= ?
      `;
      params.push(
        filters.latitude,
        filters.longitude,
        filters.latitude,
        filters.radius
      );
    }

    return db.all(query, params);
  }
}