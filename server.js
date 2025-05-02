import express from 'express';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import violationRoutes from './routes/violationRoutes.js';

import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());

// Публічні маршрути
app.use('/api/auth', authRoutes);

// Захищені маршрути (підключені через свій роутер з authCheck)
app.use('/api/violations', violationRoutes); 

app.listen(5000, () => {
  console.log('Сервер працює на порті 5000');
});