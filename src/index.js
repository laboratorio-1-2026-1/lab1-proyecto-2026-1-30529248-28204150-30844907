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
const suscripcionRoutes = require('./routes/suscripcion.routes');
const deportivoRoutes = require('./routes/deportivo.routes');
const reservaRoutes = require('./routes/reserva.routes');
const accesoRoutes = require('./routes/acceso.routes');
const biometricoRoutes = require('./routes/biometrico.routes');
const tiendaRoutes = require('./routes/tienda.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');


// ==================== MANEJO DE ERRORES ====================

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

// ====================   MÓDULO 1: GESTIÓN DE USUARIOS ====================

// Utilizar archivo de rutas (contiene autenticación, usuarios y roles)
const authRoutes = require('./routes/auth.routes');

// Montar rutas del módulo de autenticación/usuarios/roles en /api/v1
app.use('/api/v1', authRoutes);

// ==================== MÓDULO 2: INVENTARIO DE MÁQUINAS ====================

app.use('/api/v1/maquinas', maquinaRoutes);

// ==================== MÓDULO 3: SUSCRIPCIONES ====================

app.use('/api/v1/suscripciones', suscripcionRoutes);

// ==================== MÓDULO 4: GESTIÓN DEPORTIVA ====================

app.use('/api/v1/deportivo', deportivoRoutes);

// ==================== MÓDULO 5: GESTIÓN DE RESERVAS ====================

app.use('/api/v1/reservas', reservaRoutes);

// ==================== MÓDULO 6: CONTROL DE ACCESOS ====================

app.use('/api/v1/accesos', accesoRoutes);

// ==================== MÓDULO 7: CONTROL DE BIOMETRICOS ====================

app.use('/api/v1/biometrico', biometricoRoutes);

// ==================== MÓDULO 8: TIENDA ====================

app.use('/api/v1/tienda', tiendaRoutes);

// ==================== MÓDULO 9: MANTENIMIENTO ====================

app.use('/api/v1/mantenimiento', mantenimientoRoutes);



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