import express from 'express';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import cors from 'cors';
import authMiddleware from './middlewares/authMiddleware.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import router from './routes/authRoutes.js';
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://10.0.2.2:5000', 'http://192.168.0.208:5000']
}));
app.use((req, res, next) => {
  console.log('[SERVER]', req.method, req.url, 'body=', req.body);
  next();
});


app.use('/api/auth', authRoutes);


app.use('/api/violations', violationRoutes);

app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});