const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de Swagger
const swaggerSpecs = require('./config/swagger');

// Importar middlewares
const { verifyToken } = require('./middlewares/auth.middleware');
const { checkRole } = require('./middlewares/rbac.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

// Importar controladores
const authController = require('./controllers/auth.controller');
const rolController = require('./controllers/rol.controller');
const maquinaController = require('./controllers/maquina.controller');

// Importar rutas
const maquinaRoutes = require('./routes/maquina.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES GLOBALES ====================
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== SWAGGER DOCUMENTATION ====================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SmartGym API Documentation'
}));

// ==================== RUTAS PÚBLICAS ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartGym API',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs',
    endpoints: {
      auth: 'POST /api/v1/auth/login',
      swagger: 'GET /api-docs'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date() });
});

// ==================== RUTAS DE API ====================

// Autenticación
app.post('/api/v1/auth/login', (req, res, next) => {
  authController.login(req, res, next);
});

app.get('/api/v1/auth/me', (req, res, next) => {
  authController.getProfile(req, res, next);
});

// ==================== MÓDULO 1: GESTIÓN DE USUARIOS ====================

// CRUD Usuarios (solo ADMIN)
app.get('/api/v1/usuarios', verifyToken, checkRole(['ADMIN']), authController.getAllUsers);
app.get('/api/v1/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.getUserById);
app.post('/api/v1/usuarios', verifyToken, checkRole(['ADMIN']), authController.register);
app.put('/api/v1/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.updateUser);
app.delete('/api/v1/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.deleteUser);

// CRUD Roles (solo ADMIN)
app.get('/api/v1/roles', verifyToken, checkRole(['ADMIN']), rolController.getAllRoles);
app.get('/api/v1/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.getRolById);
app.post('/api/v1/roles', verifyToken, checkRole(['ADMIN']), rolController.createRol);
app.put('/api/v1/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.updateRol);
app.delete('/api/v1/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.deleteRol);

// ==================== MÓDULO 2: INVENTARIO DE MÁQUINAS ====================
app.use('/api/v1/maquinas', maquinaRoutes);

// ==================== MANEJO DE ERRORES ====================
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', mensaje: `La ruta ${req.originalUrl} no existe` });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(` Login: POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`\n Para usar Swagger:`);
  console.log(`   1. Abre http://localhost:${PORT}/api-docs`);
  console.log(`   2. Haz login con POST /auth/login`);
  console.log(`   3. Copia el token`);
  console.log(`   4. Haz clic en "Authorize" y pega: Bearer TU_TOKEN`);
  console.log(`   5. Prueba cualquier endpoint\n`);
});

module.exports = app;