import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import User from '../models/User.js';
import Violation from '../models/Violation.js'; // Додаємо імпорт моделі
import { createViolation } from '../controllers/violationController.js';

const router = Router();

const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Не авторизовано" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(db, decoded.userId); // Використовуємо findById
    
    if (!user) return res.status(401).json({ error: "Не авторизовано" });
    
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Не авторизовано" });
  }
};

// Створення правопорушення
router.post('/', authCheck, createViolation);

// Отримання правопорушень з фільтрами
router.get('/', authCheck, async (req, res) => {
  try {
    const { date, lat, lng, radius } = req.query;
    
    const violations = await Violation.findAll(db, {
      userId: req.userId, // Тільки для поточного юзера
      date: date,
      latitude: lat,
      longitude: lng,
      radius: radius
    });

    res.json(violations);
    
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання даних" });
  }
});

export default router;