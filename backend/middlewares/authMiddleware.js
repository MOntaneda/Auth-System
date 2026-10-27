import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Revalidamos contra BD → si el usuario fue borrado o desactivado, cortamos
    const [rows] = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};