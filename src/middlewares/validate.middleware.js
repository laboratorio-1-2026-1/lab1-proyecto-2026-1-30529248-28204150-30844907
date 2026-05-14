const { validationResult } = require('express-validator');
const { HTTP_STATUS, CODIGOS_ERROR } = require('../config/constantes');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Bad Request',
      codigoInterno: CODIGOS_ERROR.DATOS_INVALIDOS,
      mensaje: 'Error de validación en los datos enviados',
      timestamp: new Date().toISOString(),
      errores: errorMessages
    });
  };
};

module.exports = { validate };