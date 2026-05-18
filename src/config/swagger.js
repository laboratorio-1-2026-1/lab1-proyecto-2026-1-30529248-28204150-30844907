const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartGym API',
      version: '1.0.0',
      description: 'API para gestión integral de gimnasios - CRUD completo de usuarios y roles',
      contact: {
        name: 'SmartGym Team',
        email: 'soporte@smartgym.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido en el login'
        }
      },
      schemas: {
        // ==================== LOGIN ====================
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@smartgym.com' },
            password: { type: 'string', format: 'password', example: 'admin123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login exitoso' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                usuario: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    email: { type: 'string', example: 'admin@smartgym.com' },
                    nombre: { type: 'string', example: 'Admin' },
                    apellido: { type: 'string', example: 'Sistema' }
                  }
                }
              }
            }
          }
        },
        // ==================== USUARIOS ====================
        UsuarioRequest: {
          type: 'object',
          required: ['email', 'password', 'nombre', 'apellido', 'cedula', 'rolNombre'],
          properties: {
            email: { type: 'string', format: 'email', example: 'nuevo@test.com' },
            password: { type: 'string', format: 'password', example: '123456' },
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            cedula: { type: 'string', example: 'V-12345678' },
            telefono: { type: 'string', example: '04121234567' },
            rolNombre: { type: 'string', enum: ['ADMIN', 'FINANZAS', 'ENTRENADOR', 'CLIENTE'], example: 'CLIENTE' },
            descripcion: { type: 'string', example: 'Usuario de prueba' },
            especialidad: { type: 'string', example: 'Crossfit' } 
          }
        },
        UsuarioResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                nombre: { type: 'string' },
                apellido: { type: 'string' },
                cedula: { type: 'string' },
                telefono: { type: 'string' },
                rol: { type: 'string' },
                estado: { type: 'string' },
                tipoUsuario: { type: 'string' }
              }
            }
          }
        },
        
        // ==================== ROLES ====================
        RolRequest: {
          type: 'object',
          required: ['nombre'],
          properties: {
            nombre: { type: 'string', example: 'NUEVO_ROL' },
            descripcion: { type: 'string', example: 'Descripción del nuevo rol' }
          }
        },
        RolResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
                descripcion: { type: 'string' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            codigoInterno: { type: 'string' },
            mensaje: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },

        // ==================== MÁQUINAS ====================
        MaquinaRequest: {
        type: 'object',
        required: ['codigo', 'nombre', 'idCategoria'],
        properties: {
            codigo: { type: 'integer', example: 1001, description: 'Código único de la máquina' },
            nombre: { type: 'string', example: 'Cinta Correr T9000' },
            idCategoria: { type: 'integer', example: 1, description: 'ID de la categoría' },
            descripcion: { type: 'string', example: 'Cinta eléctrica con inclinación' },
            estado: { type: 'string', enum: ['ACTIVA', 'MANTENIMIENTO', 'FUERA_SERVICIO'], example: 'ACTIVA' }
        }
        },

        MaquinaResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                codigo: { type: 'integer' },
                nombre: { type: 'string' },
                descripcion: { type: 'string' },
                estado: { type: 'string' },
                idCategoria: { type: 'integer' },
                categoria: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    nombre: { type: 'string' },
                    descripcion: { type: 'string' }
                }
                }
            }
            }
        }
        },

        MaquinaListResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            data: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/MaquinaResponse' } },
                pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                }
                }
            }
            }
        }
        },

        EstadoUpdateRequest: {
        type: 'object',
        required: ['estado'],
        properties: {
            estado: { type: 'string', enum: ['ACTIVA', 'MANTENIMIENTO', 'FUERA_SERVICIO'], example: 'MANTENIMIENTO' }
        }
        },

        // ==================== CATEGORÍAS DE MÁQUINAS ====================
        CategoriaRequest: {
        type: 'object',
        required: ['nombre'],
        properties: {
            nombre: { type: 'string', example: 'Cardiovascular' },
            descripcion: { type: 'string', example: 'Máquinas para ejercicio cardiovascular' }
        }
        },

        CategoriaResponse: {
          type: 'object',
          properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    nombre: { type: 'string' },
                    descripcion: { type: 'string' },
                    maquinas: { type: 'array', items: { $ref: '#/components/schemas/MaquinaResponse' } }
                }
              }
          }
        },
        // ==================== PLANES DE SUSCRIPCIÓN ====================
        PlanSuscripcionRequest: {
          type: 'object',
          required: ['nombre', 'costo', 'diasDuracion'],
          properties: {
            nombre: { type: 'string', example: 'Mensualidad Básica' },
            descripcion: { type: 'string', example: 'Acceso a todas las áreas del gimnasio' },
            costo: { type: 'number', example: 35.00 },
            diasDuracion: { type: 'integer', example: 30 }
          }
        },

        PlanSuscripcionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
                descripcion: { type: 'string' },
                costo: { type: 'number' },
                diasDuracion: { type: 'integer' }
              }
            }
          }
        },

        // ==================== MEMBRESÍAS ====================
        MembresiaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idCliente: { type: 'integer' },
            idSuscripcion: { type: 'integer' },
            fechaInicio: { type: 'string', format: 'date' },
            fechaFin: { type: 'string', format: 'date' },
            estado: { type: 'string', enum: ['ACTIVA', 'VENCIDA', 'POR_VENCER'] },
            suscripcion: { $ref: '#/components/schemas/PlanSuscripcionResponse' },
            estadoActual: { type: 'string', enum: ['ACTIVA', 'VENCIDA', 'POR_VENCER'] },
            diasRestantes: { type: 'integer' }
          }
        },

        // ==================== PAGOS ====================
        PagoRequest: {
          type: 'object',
          required: ['idMembresia', 'monto', 'metodoPago'],
          properties: {
            idMembresia: { type: 'integer', example: 1 },
            monto: { type: 'number', example: 35.00 },
            metodoPago: { type: 'string', enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA_CREDITO', 'TARJETA_DEBITO'], example: 'TRANSFERENCIA' }
          }
        },

        PagoResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idMembresia: { type: 'integer' },
            monto: { type: 'number' },
            fechaPago: { type: 'string', format: 'date-time' },
            metodoPago: { type: 'string' },
            membresia: { $ref: '#/components/schemas/MembresiaResponse' }
          }
        },

        VerificarAccesoResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                activa: { type: 'boolean' },
                motivo: { type: 'string' },
                diasRestantes: { type: 'integer' },
                membresia: { $ref: '#/components/schemas/MembresiaResponse' }
              }
            }
          }
        },
        
        // ==================== DISCIPLINAS ====================
        DisciplinaRequest: {
          type: 'object',
          required: ['nombre'],
          properties: {
            nombre: { type: 'string', example: 'Spinning' },
            descripcion: { type: 'string', example: 'Ciclismo indoor' }
          }
        },

        DisciplinaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' }
          }
        },

        // ==================== SESIONES ====================
        SesionRequest: {
          type: 'object',
          required: ['idDisciplina', 'idEntrenador', 'fecha', 'horaInicio', 'horaFin'],
          properties: {
            idDisciplina: { type: 'integer', example: 1 },
            idEntrenador: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date', example: '2024-12-20' },
            horaInicio: { type: 'string', example: '10:00' },
            horaFin: { type: 'string', example: '11:00' },
            limiteDeCupos: { type: 'integer', example: 20 }
          }
        },

        SesionResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idDisciplina: { type: 'integer' },
            idEntrenador: { type: 'integer' },
            fecha: { type: 'string', format: 'date' },
            horaInicio: { type: 'string' },
            horaFin: { type: 'string' },
            limiteDeCupos: { type: 'integer' },
            estado: { type: 'string' },
            cuposOcupados: { type: 'integer' },
            cuposDisponibles: { type: 'integer' },
            disciplina: { $ref: '#/components/schemas/DisciplinaResponse' }
          }
        },

        // ==================== RESERVAS ====================
        ReservaRequest: {
          type: 'object',
          required: ['clienteId', 'sesionId'],
          properties: {
            clienteId: { type: 'integer', example: 1 },
            sesionId: { type: 'integer', example: 1 }
          }
        },

        ReservaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idCliente: { type: 'integer' },
            idSesion: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            estado: { type: 'string' },
            sesion: { $ref: '#/components/schemas/SesionResponse' }
          }
        },
        
        // ==================== GESTIÓN DEPORTIVA ====================
        DisciplinaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' }
          }
        },

        EntrenadorResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idUsuario: { type: 'integer' },
            especialidad: { type: 'string' },
            usuario: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                nombre: { type: 'string' },
                apellido: { type: 'string' }
              }
            }
          }
        },

        SesionRequest: {
          type: 'object',
          required: ['idDisciplina', 'idEntrenador', 'fecha', 'horaInicio', 'horaFin'],
          properties: {
            idDisciplina: { type: 'integer', example: 1 },
            idEntrenador: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date', example: '2024-12-20' },
            horaInicio: { type: 'string', example: '10:00' },
            horaFin: { type: 'string', example: '11:00' },
            limiteDeCupos: { type: 'integer', example: 20 }
          }
        },

        SesionResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idDisciplina: { type: 'integer' },
            idEntrenador: { type: 'integer' },
            fecha: { type: 'string', format: 'date' },
            horaInicio: { type: 'string' },
            horaFin: { type: 'string' },
            limiteDeCupos: { type: 'integer' },
            estado: { type: 'string' },
            disciplina: { $ref: '#/components/schemas/DisciplinaResponse' },
            entrenador: { $ref: '#/components/schemas/EntrenadorResponse' }
          }
        },

        // ==================== RESERVAS ====================
        ReservaRequest: {
          type: 'object',
          required: ['sesionId'],
          properties: {
            sesionId: { type: 'integer', example: 1 }
          }
        },

        ReservaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idCliente: { type: 'integer' },
            idSesion: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            estado: { type: 'string' },
            sesion: { $ref: '#/components/schemas/SesionResponse' }
          }
        },

        SesionDisponibleResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            idDisciplina: { type: 'integer' },
            idEntrenador: { type: 'integer' },
            fecha: { type: 'string', format: 'date' },
            horaInicio: { type: 'string' },
            horaFin: { type: 'string' },
            limiteDeCupos: { type: 'integer' },
            cuposOcupados: { type: 'integer' },
            cuposDisponibles: { type: 'integer' },
            hayCupos: { type: 'boolean' },
            disciplina: { $ref: '#/components/schemas/DisciplinaResponse' },
            entrenador: { $ref: '#/components/schemas/EntrenadorResponse' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'] 
};

module.exports = swaggerJsdoc(options);