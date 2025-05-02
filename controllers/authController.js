import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const existingUser = await User.findByEmail(db, email);
    if (existingUser) return res.status(409).json({ error: "Користувач існує" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create(db, { 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword 
    });

    res.status(201).json({ userId });
  } catch (error) {
    res.status(500).json({ error: "Помилка реєстрації" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Спроба входу для email:', email);

    // 1. Шукаємо користувача
    const user = await User.findByEmail(db, email); 
    
    if (!user) {
      console.log('Користувача не знайдено');
      return res.status(401).json({ error: "Невірні дані" });
    }

    // 2. Порівнюємо паролі
    console.log('Збережений хеш:', user.password.substring(0, 15) + '...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    // 3. Перевірка результату
    if (!isMatch) {
      console.log('Паролі не збігаються');
      return res.status(401).json({ error: "Невірні дані" });
    }

    // 4. Генерація токена
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Успішний вхід для userId:', user.id);
    res.json({ token, userId: user.id });

  } catch (error) {
    console.error('Помилка входу:', error);
    res.status(500).json({ error: "Помилка входу" });
  }
};;