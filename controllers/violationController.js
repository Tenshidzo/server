import db from '../config/db.js';
import Violation from '../models/Violation.js';
export const createViolation = async (req, res) => {
  try {
    const { description, latitude, longitude, date, imageUrl } = req.body;
    const userId = req.userId;
    if (!description || !latitude || !longitude || !imageUrl) {
      return res.status(400).json({ error: 'Всі поля (description, latitude, longitude, imageUrl) є обовʼязковими' });
    }
    if (description.length < 5) {
      return res.status(400).json({ error: 'Опис має містити щонайменше 5 символів' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Некоректні координати (latitude/longitude)' });
    }
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Некоректне посилання на зображення' });
    }
    let dbDate;
    try {
      dbDate = date ? new Date(date).toISOString() : new Date().toISOString();
    } catch (e) {
      console.warn('Ошибка парсинга даты, используется текущая дата');
      dbDate = new Date().toISOString();
    }

    await db.run(
      `INSERT INTO violations 
       (description, imageUrl, userId, latitude, longitude, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [description, imageUrl, userId, latitude, longitude, dbDate]
    );

    console.log('Нарушение добавлено с датой:', dbDate);
    return res.status(201).json({ success: true });

  } catch (err) {
    console.error('Ошибка при создании:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



export const getViolations = async (req, res) => {
  try {
    console.log('getViolations called, query:', req.query);
    const { month, year, date } = req.query;
    
    if (date) {
      const violations = await Violation.findAll(db, {
        userId: req.userId || null,
        date
      });
      console.log(`getViolations by date ${date}, count:`, violations.length);
      return res.json(violations);
    }

    if (!month || !year) {
      console.log('getViolations missing month/year');
      return res
        .status(400)
        .json({ error: "Потрібні параметри month і year або date" });
    }

    const violations = await Violation.findByDate(db, {
      month: parseInt(month),
      year: parseInt(year)
    });
    console.log(`getViolations by month ${month}/${year}, count:`, violations.length);

    res.json(violations);
  } catch (error) {
    console.error('Ошибка getViolations:', error.message);
    res.status(500).json({ error: "Помилка сервера" });
  }
};
export const getMyViolations = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, lat, lng, radius } = req.query;

    let sql = `
      SELECT 
        id, 
        description, 
        imageUrl as image, 
        date, 
        userId, 
        latitude, 
        longitude 
      FROM violations 
      WHERE userId = ?
    `;
    const params = [userId];

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      sql += ` AND date BETWEEN ? AND ?`;
      params.push(start.toISOString(), end.toISOString());
    }
    if (lat && lng && radius) {
      const r = parseFloat(radius);
      const latFloat = parseFloat(lat);
      const lngFloat = parseFloat(lng);

      const latDelta = r / 111;
      const lngDelta = r / (111 * Math.cos(latFloat * (Math.PI / 180)));

      const minLat = latFloat - latDelta;
      const maxLat = latFloat + latDelta;
      const minLng = lngFloat - lngDelta;
      const maxLng = lngFloat + lngDelta;

      sql += ` AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
      params.push(minLat, maxLat, minLng, maxLng);
    }

    sql += ` ORDER BY date DESC`;

    const all = await db.all(sql, params);

    console.log(`📦 Найдено нарушений: ${all.length}`);
    return res.json(all);
  } catch (err) {
    console.error('❌ Ошибка getMyViolations:', err.message);
    return res.status(500).json({ error: 'Не удалось получить ваши нарушения' });
  }
};

export const deleteViolation = async (req, res) => {
  try {
    console.log('deleteViolation called, params:', req.params);
    const id = parseInt(req.params.id, 10);
    const userId = req.userId;
    console.log(`deleteViolation userId: ${userId}, id: ${id}`);

    const result = await Violation.deleteById(db, { id, userId });
    console.log('deleteViolation result:', result);
    return res.json({ success: true });
  } catch (err) {
    console.error('Ошибка deleteViolation:', err.message);
    res.status(500).json({ error: 'Не удалось удалить' });
  }
};
export const getPublicViolations = async (req, res) => {
  try {
    const all = await db.all(`
      SELECT 
        id, 
        description, 
        imageUrl as image, 
        date, 
        userId, 
        latitude, 
        longitude 
      FROM violations
      ORDER BY date DESC
    `);

    console.log('📍 Публичные нарушения, количество:', all.length);
    return res.json(all);
  } catch (err) {
    console.error('❌ Ошибка получения публичных нарушений:', err.message);
    res.status(500).json({ error: 'Не удалось получить публичные нарушения' });
  }
};