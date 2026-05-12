const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartGym API',
      version: '1.0.0',
      description: 'API para gestión integral de gimnasios',
      contact: {
        name: 'Equipo SmartGym',
        email: 'smartgym@ucla.edu.ve'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT: Bearer <token>'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            codigoInterno: { type: 'string' },
            mensaje: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
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
            message: { type: 'string' },
            token: { type: 'string' },
            usuario: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                rol: { type: 'string' },
                estado: { type: 'string' }
              }
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'nombre', 'apellido', 'cedula'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            cedula: { type: 'string' },
            telefono: { type: 'string' },
            idRol: { type: 'integer', enum: [1, 2, 3, 4], default: 4 }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);