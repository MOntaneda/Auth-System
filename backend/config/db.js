import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Pool de conexiones: reutiliza conexiones → mejor rendimiento y escalabilidad
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: true,
});

// Helper de prueba rápida al arrancar
export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL conectado');
  } catch (err) {
    console.error('❌ Error MySQL:', err.message);
    process.exit(1);
  }
};