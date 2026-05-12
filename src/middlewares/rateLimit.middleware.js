const rateLimit = require('express-rate-limit');
const { HTTP_STATUS, CONFIG_TECNICA } = require('../config/constantes');

// Limitador para login
const loginRateLimiter = rateLimit({
  windowMs: CONFIG_TECNICA.TIEMPO_BLOQUEO_LOGIN_MINUTOS * 60 * 1000,
  max: CONFIG_TECNICA.MAX_INTENTOS_LOGIN,
  message: {
    error: 'Too Many Requests',
    mensaje: `Demasiados intentos fallidos. Intente de nuevo en ${CONFIG_TECNICA.TIEMPO_BLOQUEO_LOGIN_MINUTOS} minutos.`,
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador para registro (limitación más suave)
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 registros por hora
  message: {
    error: 'Too Many Requests',
    mensaje: 'Demasiados registros desde esta IP. Por favor, intente más tarde.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginRateLimiter,
  registerRateLimiter
};