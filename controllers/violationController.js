import db from '../config/db.js';
import Violation from '../models/Violation.js';

export const createViolation = async (req, res) => {
  try {
    console.log("Данные запроса:", req.body);
    console.log("userId:", req.userId)
    const { description, imageUrl, latitude, longitude } = req.body;
    
    if (!description || !latitude || !longitude) {
      return res.status(400).json({ error: "Необхідно вказати опис, широту та довготу" });
    }

    // Создание нарушения
    const violationId = await Violation.create(db, {
      description,
      imageUrl: imageUrl || null,
      userId: req.userId,
      latitude,
      longitude
    });

    res.status(201).json({
      id: violationId,
      message: "Правопорушення успішно створено"
    });

  } catch (error) {
    console.error("Помилка при створенні:", error);
    res.status(500).json({ error: "Помилка сервера при створенні правопорушення" });
  }
};

export const getViolations = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Валидация параметров
    if (!month || !year) {
      return res.status(400).json({ error: "Требуются параметры month и year" });
    }

    const violations = await Violation.findByDate(db, { 
      month: parseInt(month),
      year: parseInt(year)
    });

    res.json(violations);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};