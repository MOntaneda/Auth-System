import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { validateRegister, isValidEmail } from '../utils/validators.js';

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

// Opciones de cookie seguras
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

// ============ REGISTRO ============
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    const errors = validateRegister({ username, email, password });
    if (errors.length) {
      return res.status(400).json({ message: 'Datos inválidos', errors });
    }

    // Verificación explícita de duplicados
    const [existing] = await pool.query(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email.toLowerCase(), username]
    );
    if (existing.length) {
      const field = existing[0].email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        message: `El ${field} ya está registrado`,
        errors: [`${field} duplicado`],
      });
    }

    // Hash de contraseña (cost 12)
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email.toLowerCase(), passwordHash]
    );

    const user = { id: result.insertId, username, email: email.toLowerCase(), role: 'user' };

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      accessToken,
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============ LOGIN ============
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    // Mensaje genérico: no revelar si el email existe
    if (!rows.length) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const dbUser = rows[0];
    if (!dbUser.is_active) {
      return res.status(403).json({ message: 'Cuenta desactivada' });
    }

    const match = await bcrypt.compare(password, dbUser.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const user = { id: dbUser.id, username: dbUser.username, email: dbUser.email, role: dbUser.role };
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Login exitoso', user, accessToken });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============ ME (verificación de sesión) ============
export const me = async (req, res) => {
  // req.user viene del authMiddleware
  return res.json({ user: req.user });
};

// ============ LOGOUT ============
export const logout = (req, res) => {
  res.clearCookie('refreshToken', cookieOpts);
  return res.json({ message: 'Sesión cerrada' });
};

// ============ REFRESH (opcional, para escalabilidad) ============
/* export const refresh = (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No autenticado' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccess = jwt.sign(
      { id: payload.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return res.json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({ message: 'Refresh token inválido' });
  } */
 // ============ REFRESH ============
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No autenticado' });

    // 1. Verificamos el refresh token
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 2. Buscamos al usuario en la BD (por seguridad, por si fue borrado o desactivado)
    const [rows] = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ message: 'Usuario no válido o inactivo' });
    }

    const user = rows[0];

    // 3. Generamos un nuevo Access Token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Devolvemos el token y los datos del usuario
    return res.json({ accessToken: newAccessToken, user });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
};
