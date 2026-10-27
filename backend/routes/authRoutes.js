import { Router } from 'express';
import rateLimit from 'express-rate-limit'; // <-- Importamos
import { register, login, me, logout, refresh } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { verifyTurnstile } from '../middlewares/turnstileMiddleware.js';



const router = Router();

// 1. Configuración del limitador para el Login (Fuerza Bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos por IP
  message: { message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.' },
  standardHeaders: true, // Devuelve info del límite en los headers (RateLimit-*)
  legacyHeaders: false, // Desactiva los headers antiguos (X-RateLimit-*)
  skipSuccessfulRequests: true, // Solo cuenta los intentos FALLIDOS (los exitosos no suman)
});

// 2. Configuración del limitador para el Registro (Spam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Límite de 10 cuentas creadas por IP por hora
  message: { message: 'Has creado demasiadas cuentas desde esta IP. Inténtalo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ RUTAS APLICANDO LOS LIMITADORES ============

// Añadimos verifyTurnstile ANTES del controlador
//router.post('/register', registerLimiter, verifyTurnstile, register);
router.post('/register', registerLimiter,  register);

// Aplicamos loginLimiter SOLO a la ruta de login
router.post('/login', loginLimiter, login);

// Aplicamos registerLimiter SOLO a la ruta de registro
router.post('/register', registerLimiter, register);

// Las demás rutas quedan libres
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', requireAuth, me);

export default router;