const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler.middleware');

// Importar configuración de Swagger
const swaggerSpecs = require('./config/swagger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');

// Constantes
const HTTP_STATUS = require('./config/constantes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas
app.use('/api/v1/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SmartGym API',
    version: '1.0.0',
    status: 'Operational',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      login: 'POST /api/v1/auth/login',
      register: 'POST /api/v1/auth/register',
      perfil: 'GET /api/v1/auth/me',
      logout: 'POST /api/v1/auth/logout'
    }
  });
});

app.get('/api/v1/auth/login', (req, res) => {
  res.status(200).json({
    message: 'Endpoint de login - Enviar email y password en el cuerpo de la solicitud',
    ejemplo: {
      email: '',
      password: ''
    }
  });
  })

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Ruta 404
app.use('/errors/404', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    codigoInterno: 'NO_ENCONTRADO',
    mensaje: `La ruta ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    codigoInterno: 'NO_ENCONTRADO',
    mensaje: `La ruta ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Módulo de Autenticación activo`);
  console.log(`\n📝 Endpoints de autenticación:`);
  console.log(`   POST   /api/v1/auth/login`);
  console.log(`   POST   /api/v1/auth/register`);
  console.log(`   GET    /api/v1/auth/me (requiere token)`);
  console.log(`   POST   /api/v1/auth/logout (requiere token)`);
});

module.exports = app;