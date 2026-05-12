// Solo valores que NO cambian en la vida del sistema
// Los datos editables (roles, categorías, disciplinas, planes, métodos pago) van en BD

// ==================== CÓDIGOS DE ESTADO HTTP ====================

const HTTP_STATUS = {
    // 2xx - Respuestas exitosas
  OK: 200,           // Solicitud exitosa (GET, PUT, PATCH)
  CREATED: 201,      // Recurso creado exitosamente (POST)
  
  // 4xx - Errores del cliente
  BAD_REQUEST: 400,  // Datos inválidos o error de validación
  UNAUTHORIZED: 401, // Token no provisto, inválido o expirado
  FORBIDDEN: 403,    // Token válido pero rol sin permisos
  NOT_FOUND: 404,    // Recurso no existe
  CONFLICT: 409,     // Regla de negocio fallida (cupo lleno, solapamiento, etc.)
  
  // 5xx - Errores del servidor
  INTERNAL_SERVER_ERROR: 500  // Error interno del servidor
}

// ==================== CÓDIGOS DE ERROR INTERNOS ====================

const CODIGOS_ERROR = {
  // Reglas de negocio (409 Conflict)
  CUPO_LLENO: 'CUPO_LLENO',
  HORARIO_SOLAPADO: 'HORARIO_SOLAPADO',
  MEMBRESIA_VENCIDA: 'MEMBRESIA_VENCIDA',
  MEMBRESIA_INACTIVA: 'MEMBRESIA_INACTIVA',
  STOCK_INSUFICIENTE: 'STOCK_INSUFICIENTE',
  ACCESO_DENEGADO_FISICO: 'ACCESO_DENEGADO_FISICO',
  
  // Autenticación (401 Unauthorized)
  TOKEN_NO_PROVIDO: 'TOKEN_NO_PROVIDO',
  TOKEN_INVALIDO: 'TOKEN_INVALIDO',
  TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
  CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
  
  // Autorización (403 Forbidden)
  PERMISO_DENEGADO: 'PERMISO_DENEGADO',
  ROL_NO_AUTORIZADO: 'ROL_NO_AUTORIZADO',
  
  // Recursos (404 Not Found)
  NO_ENCONTRADO: 'NO_ENCONTRADO',
  RECURSO_ELIMINADO: 'RECURSO_ELIMINADO',
  
  // Validaciones (400 Bad Request)
  DATOS_INVALIDOS: 'DATOS_INVALIDOS',
  CAMPO_REQUERIDO: 'CAMPO_REQUERIDO',
  FORMATO_INVALIDO: 'FORMATO_INVALIDO',
  DUPLICADO: 'DUPLICADO',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
}

// ==================== ESTADOS GENERALES ====================

const ESTADOS_GENERALES = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  PENDIENTE: 'pendiente',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado'
}

// ==================== ESTADOS DE MÁQUINAS ====================

const ESTADO_MAQUINA = {
  ACTIVA: 'activa',
  EN_MANTENIMIENTO: 'en_mantenimiento',
  FUERA_SERVICIO: 'fuera_de_servicio'
}

// ==================== ESTADO DE MEMBRESÍA ====================

const ESTADO_MEMBRESIA = {
  ACTIVA: 'Activa',
  VENCIDA: 'Vencida',
  POR_VENCER: 'Por Vencer'
}

// ==================== ESTADO DE RESERVAS ====================

const ESTADO_RESERVA = {
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
  COMPLETADA: 'completada',
  PENDIENTE: 'pendiente'
}

// ==================== ESTADO DE ACCESO ====================

const ESTADO_ACCESO = {
  PERMITIDO: 'permitido',
  DENEGADO: 'denegado'
}

const MOTIVO_RECHAZO_ACCESO = {
  MEMBRESIA_VENCIDA: 'Membresía vencida',
  MEMBRESIA_INACTIVA: 'Membresía inactiva',
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',
  HORARIO_NO_PERMITIDO: 'Horario no permitido'
}

// ==================== ESTADO DE SESIONES ====================

const ESTADO_SESION = {
  PROGRAMADA: 'programada',
  EN_CURSO: 'en_curso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
}

// ==================== TIPOS DE ENTRENAMIENTO ====================

const TIPO_ENTRENAMIENTO = {
  INDIVIDUAL: 'individual',
  GRUPAL: 'grupal',
  ONLINE: 'online'
}

// ==================== TIPOS DE TICKETS DE MANTENIMIENTO ====================

const TIPO_TICKET = {
  CORRECTIVO: 'correctivo',
  PREVENTIVO: 'preventivo',
  URGENTE: 'urgente'
}

const PRIORIDAD_TICKET = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica'
}

// ==================== CONFIGURACIÓN TÉCNICA ====================

const CONFIG_TECNICA = {
  ITEMS_POR_PAGINA_DEFECTO: 10,
  ITEMS_POR_PAGINA_MAX: 100,
  MAX_INTENTOS_LOGIN: 3,
  TIEMPO_BLOQUEO_LOGIN_MINUTOS: 15
}

// ==================== EXPRESIONES REGULARES ====================

const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  TELEFONO: /^[0-9]{10,15}$/,
  CEDULA: /^[0-9]{7,15}$/,
  NOMBRE: /^[a-zA-ZáéíóúñÑÁÉÍÓÚ\s]{2,50}$/,
  CONTRASENA: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
}

// ==================== MENSAJES DEL SISTEMA ====================

const MENSAJES = {
  EXITOS: {
    [HTTP_STATUS.OK]: 'Solicitud exitosa',
    [HTTP_STATUS.CREATED]: 'Recurso creado exitosamente',
    REGISTRO: 'Registro exitoso',
    ACTUALIZACION: 'Datos actualizados correctamente',
    ELIMINACION: 'Eliminado correctamente',
    RESERVA_CONFIRMADA: 'Reserva confirmada exitosamente',
    RESERVA_CANCELADA: 'Reserva cancelada exitosamente',
    PAGO_REGISTRADO: 'Pago registrado correctamente',
    ACCESO_PERMITIDO: 'Acceso permitido',
    LOGIN_EXITOSO: 'Inicio de sesión exitoso'
  },
  ERROR: {
    [HTTP_STATUS.BAD_REQUEST]: 'Datos inválidos o error de validación',
    [HTTP_STATUS.UNAUTHORIZED]: 'No autenticado. Token no provisto, inválido o expirado',
    [HTTP_STATUS.FORBIDDEN]: 'No autorizado. No tienes permisos para esta acción',
    [HTTP_STATUS.NOT_FOUND]: 'Recurso no encontrado',
    [HTTP_STATUS.CONFLICT]: 'Conflicto con reglas de negocio',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
    
    GENERICO: 'Ocurrió un error inesperado',
    CUPO_LLENO: 'No hay cupos disponibles para esta sesión',
    HORARIO_SOLAPADO: 'Ya tienes una reserva en el mismo horario',
    MEMBRESIA_VENCIDA: 'Tu membresía está vencida. Renueva para acceder',
    STOCK_INSUFICIENTE: 'Stock insuficiente del producto',
    ACCESO_DENEGADO: 'Acceso denegado'
  }
}

// ==================== TOKENS ====================

const TOKENS = {
    JWT_EXPIRES_IN: "2h"
}

exports = {
  HTTP_STATUS,
  CODIGOS_ERROR,
  MENSAJES,
  CONFIG_TECNICA,
  REGEX,
  TIPO_ENTRENAMIENTO,
  TIPO_TICKET,  
  PRIORIDAD_TICKET,
  ESTADO_SESION,
  TOKENS,
  ESTADOS_GENERALES,
  ESTADO_MAQUINA,
  ESTADO_MEMBRESIA,
  ESTADO_RESERVA,
  ESTADO_ACCESO,
  MOTIVO_RECHAZO_ACCESO,
}