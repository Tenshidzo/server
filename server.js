import express from 'express';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://10.0.2.2:5000', 'http://192.168.1.100:5000']
}));
app.use((req, res, next) => {
  console.log('[SERVER]', req.method, req.url, 'body=', req.body);
  next();
});

// Публічні маршрути
app.use('/api/auth', authRoutes);

// Захищені маршрути 
app.use('/api/violations', violationRoutes); 

app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});