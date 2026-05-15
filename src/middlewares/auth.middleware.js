const jwt = require('jsonwebtoken');
const { HTTP_STATUS, CODIGOS_ERROR } = require('../config/constantes');
const { isBlacklisted } = require('../utils/tokenBlacklist');

let decoded = null;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(' Verificando token...');
  console.log('   Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(' Token no proporcionado');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      codigoInterno: CODIGOS_ERROR.TOKEN_NO_PROVIDO,
      mensaje: 'Token no proporcionado',
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.split(' ')[1];
  console.log('   Token extraído:', token.substring(0, 20) + '...');

  if (isBlacklisted(token)) {
    console.log(' Token en blacklist');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      codigoInterno: CODIGOS_ERROR.TOKEN_INVALIDO,
      mensaje: 'Token inválido o cerrado sesión',
      timestamp: new Date().toISOString()
    });
  }

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(' Token decodificado:', decoded);
    next();
    return { decoded };
  } catch (error) {
    console.log(' Error verificando token:', error.message);
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