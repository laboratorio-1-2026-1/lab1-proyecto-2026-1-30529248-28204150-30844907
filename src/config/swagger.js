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
        // Modelo Login
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
        // Modelo Usuario
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
        
        // Modelo Rol
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
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'] 
};

module.exports = swaggerJsdoc(options);