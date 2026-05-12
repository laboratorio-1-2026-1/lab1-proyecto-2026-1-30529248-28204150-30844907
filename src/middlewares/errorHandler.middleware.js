// src/middlewares/errorHandler.middleware.js
const { HTTP_STATUS, CODIGOS_ERROR, MENSAJES } = require('../config/constantes');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Si el error ya tiene estructura definida
  if (err.status && err.code) {
    return res.status(err.status).json({
      error: getErrorName(err.status),
      codigoInterno: err.code,
      mensaje: err.message,
      timestamp: new Date().toISOString(),
      ...(err.details && { detalles: err.details })
    });
  }

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: 'Conflict',
      codigoInterno: CODIGOS_ERROR.DUPLICADO,
      mensaje: `Ya existe un registro con ese ${err.meta?.target?.join(', ') || 'valor'}`,
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2025') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'Not Found',
      codigoInterno: CODIGOS_ERROR.NO_ENCONTRADO,
      mensaje: 'Registro no encontrado',
      timestamp: new Date().toISOString()
    });
  }

  // Error genérico
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    codigoInterno: CODIGOS_ERROR.DATOS_INVALIDOS,
    mensaje: MENSAJES.ERROR[HTTP_STATUS.INTERNAL_SERVER_ERROR],
    timestamp: new Date().toISOString()
  });
};

const getErrorName = (status) => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST: return 'Bad Request';
    case HTTP_STATUS.UNAUTHORIZED: return 'Unauthorized';
    case HTTP_STATUS.FORBIDDEN: return 'Forbidden';
    case HTTP_STATUS.NOT_FOUND: return 'Not Found';
    case HTTP_STATUS.CONFLICT: return 'Conflict';
    default: return 'Error';
  }
};

module.exports = errorHandler;