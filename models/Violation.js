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
  static async findAll(db, filters) {
    let query = 'SELECT * FROM violations WHERE userId = ?';
    const params = [filters.userId];

    // Фільтр по даті
    if (filters.date) {
      query += ' AND DATE(date) = ?';
      params.push(filters.date);
    }

    // Фільтр по геолокації
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