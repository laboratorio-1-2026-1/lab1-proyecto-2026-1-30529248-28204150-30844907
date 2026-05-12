// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { HTTP_STATUS, CODIGOS_ERROR } = require('../config/constantes');
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      codigoInterno: CODIGOS_ERROR.TOKEN_NO_PROVIDO,
      mensaje: 'Token no proporcionado',
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.split(' ')[1];

  // Verificar si el token está en blacklist
  if (isTokenBlacklisted(token)) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      codigoInterno: CODIGOS_ERROR.TOKEN_INVALIDO,
      mensaje: 'Token inválido o cerrado sesión',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    let codigo = CODIGOS_ERROR.TOKEN_INVALIDO;
    let mensaje = 'Token inválido';

    if (error.name === 'TokenExpiredError') {
      codigo = CODIGOS_ERROR.TOKEN_EXPIRADO;
      mensaje = 'Token expirado';
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      codigoInterno: codigo,
      mensaje: mensaje,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { verifyToken };