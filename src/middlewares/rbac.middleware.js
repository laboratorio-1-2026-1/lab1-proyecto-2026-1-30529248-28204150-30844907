const { HTTP_STATUS, CODIGOS_ERROR } = require('../config/constantes');

// Mapeo de roles permitidos para cada recurso/módulo
const rolePermissions = {

  // Módulo de Usuarios (solo Admin)
  usuarios: ['Administrador'],
  
  // Módulo de Inventario
  maquinas: {
    GET: ['Administrador', 'Finanzas', 'Entrenadores', 'Clientes'],
    POST: ['Administrador'],
    PUT: ['Administrador'],
    DELETE: ['Administrador'],
    PATCH_ESTADO: ['Administrador', 'Encargado de Mantenimiento']
  },
  
  // Módulo Deportivo
  sesiones: {
    GET: ['Administrador', 'Finanzas', 'Entrenadores', 'Clientes'],
    POST: ['Administrador', 'Coordinador'],
    PUT: ['Administrador'],
    DELETE: ['Administrador']
  },
  
  // Módulo Financiero
  finanzas: ['Administrador', 'Finanzas'],
  
  // Módulo de Acceso
  acceso: ['Administrador', 'Recepcionista']
};

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * @param {string[]} allowedRoles - Array de nombres de roles permitidos
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.rolNombre;

    if (!userRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Forbidden',
        codigoInterno: CODIGOS_ERROR.PERMISO_DENEGADO,
        mensaje: 'No se pudo identificar el rol del usuario',
        timestamp: new Date().toISOString()
      });
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Forbidden',
      codigoInterno: CODIGOS_ERROR.ROL_NO_AUTORIZADO,
      mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  };
};

/**
 * Middleware para verificar permiso específico por módulo y método
 * @param {string} module - Módulo al que se intenta acceder
 * @param {string} method - Método HTTP
 */
const checkPermission = (module, method = null) => {
  return (req, res, next) => {
    const userRole = req.user?.rolNombre;
    const httpMethod = method || req.method;

    if (!userRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Forbidden',
        codigoInterno: CODIGOS_ERROR.PERMISO_DENEGADO,
        mensaje: 'No se pudo identificar el rol del usuario',
        timestamp: new Date().toISOString()
      });
    }

    const permissions = rolePermissions[module];
    if (!permissions) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Forbidden',
        codigoInterno: CODIGOS_ERROR.PERMISO_DENEGADO,
        mensaje: 'Módulo no reconocido',
        timestamp: new Date().toISOString()
      });
    }

    let allowedRoles = [];
    if (Array.isArray(permissions)) {
      allowedRoles = permissions;
    } else if (permissions[httpMethod]) {
      allowedRoles = permissions[httpMethod];
    } else if (permissions[req.route?.stack[0]?.method]) {
      // Para casos específicos como PATCH_ESTADO
      allowedRoles = permissions[req.route?.stack[0]?.method] || [];
    } else {
      allowedRoles = [];
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Forbidden',
      codigoInterno: CODIGOS_ERROR.ROL_NO_AUTORIZADO,
      mensaje: `Acceso denegado. El rol ${userRole} no tiene permisos para esta acción`,
      timestamp: new Date().toISOString()
    });
  };
};

module.exports = { checkRole, checkPermission };