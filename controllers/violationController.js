import db from '../config/db.js';
import Violation from '../models/Violation.js';

export const createViolation = async (req, res) => {
  try {
    console.log("Данные запроса:", req.body);
    console.log("userId:", req.userId);
    // Проверка обязательных полей
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

export const getViolationImage = async (req, res) => {
  try {
    const violation = await Violation.findById(db, req.params.id);
    
    if (!violation?.image) {
      return res.status(404).json({ error: "Зображення не знайдено" });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(violation.image);
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання" });
  }
};