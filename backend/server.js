import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // ✅ Bien
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();

// Importante para que Rate Limit identifique bien las IPs en desarrollo local
app.set('trust proxy', 1); 


app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true, // necesario para cookies
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Endpoint no encontrado' }));

// Manejador global de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

const PORT = process.env.PORT || 4000;

const start = async () => {
  await testConnection();
  app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
};
start();