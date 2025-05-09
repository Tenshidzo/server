import db from '../config/db.js';
import Violation from '../models/Violation.js';

export const createViolation = async (req, res) => {
  try {
    const { description, latitude, longitude, imageUrl } = req.body;
    const userId = req.userId;               

    if (!description || !latitude || !longitude || !imageUrl) {
      return res.status(400).json({ error: 'Не всі поля заповнені' });
    }

    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.run(
      `INSERT INTO violations
         (description, imageUrl, date, userId, latitude, longitude, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [description, imageUrl, date, userId, latitude, longitude, 0]
    );

    console.log('Нарушение добавлено для userId:', userId);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Ошибка при создании:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
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
    console.log('getMyViolations called');
    const userId = req.userId;
    console.log('getMyViolations userId:', userId);

    const all = await Violation.findAll(db, { userId });
    console.log('getMyViolations count:', all.length);
    return res.json(all);
  } catch (err) {
    console.error('Ошибка getMyViolations:', err.message);
    res.status(500).json({ error: 'Не удалось получить ваши нарушения' });
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