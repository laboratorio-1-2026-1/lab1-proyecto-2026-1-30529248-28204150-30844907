module.exports = {
  // ==================== Estados HTTP ====================
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // ==================== Códigos de error internos ====================
  CODIGOS_ERROR: {
    CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
    TOKEN_NO_PROVIDO: 'TOKEN_NO_PROVIDO',
    TOKEN_INVALIDO: 'TOKEN_INVALIDO',
    TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
    DUPLICADO: 'DUPLICADO',
    NO_ENCONTRADO: 'NO_ENCONTRADO',
    PERMISO_DENEGADO: 'PERMISO_DENEGADO',
    ROL_NO_AUTORIZADO: 'ROL_NO_AUTORIZADO',
    DATOS_INVALIDOS: 'DATOS_INVALIDOS',
    CAMPO_REQUERIDO: 'CAMPO_REQUERIDO'
  },

  // ==================== Estados generales ====================
  ESTADOS_GENERALES: {
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO'
  },

  // ==================== Configuración de tokens ====================
  TOKENS: {
    JWT_EXPIRES_IN: '2h'
  },

  // ==================== Mensajes de respuesta ====================
  MENSAJES: {
    EXITOS: {
      LOGIN_EXITOSO: 'Login exitoso',
      REGISTRO: 'Usuario registrado exitosamente',
      ACTUALIZACION: 'Usuario actualizado exitosamente',
      ELIMINACION: 'Usuario eliminado exitosamente',
      200: 'Operación exitosa'
    },
    ERROR: {
      500: 'Error interno del servidor'
    }
  },

  // ==================== Configuración técnica ====================
  CONFIG_TECNICA: {
    TIEMPO_BLOQUEO_LOGIN_MINUTOS: 15,
    MAX_INTENTOS_LOGIN: 5
  }
};