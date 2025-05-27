import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import User from '../models/User.js';


export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Усі поля обовʼязкові для заповнення' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Неправильний формат email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль має містити щонайменше 6 символів' });
    }

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

    const user = await User.findByEmail(db, email); 
    
    if (!user) {
      console.log('Користувача не знайдено');
      return res.status(401).json({ error: "Невірні дані" });
    }

    console.log('Збережений хеш:', user.password.substring(0, 15) + '...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Паролі не збігаються');
      return res.status(401).json({ error: "Невірні дані" });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    console.log('Успішний вхід для userId:', user.id);
    res.json({ token, userId: user.id });

  } catch (error) {
    console.error('Помилка входу:', error);
    res.status(500).json({ error: "Помилка входу" });
  }
};