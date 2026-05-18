const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rolController = require('../controllers/rol.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

// ==================== VALIDACIONES ====================
const loginValidations = [
  body('email').notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const registerValidations = [
  body('email').notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida').isLength({ min: 6 }),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('cedula').notEmpty().withMessage('La cédula es requerida'),
  body('rolNombre').notEmpty().withMessage('El rolNombre es requerido')
];

// ==================== RUTAS PÚBLICAS ====================

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/auth/login', validate(loginValidations), authController.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener perfil propio
 *     description: Devuelve los datos del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       401:
 *         description: No autorizado
 */
router.get('/auth/me', verifyToken, authController.getProfile);

// ==================== CRUD USUARIOS ====================

/**
 * @swagger
 * /api/v1/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Obtiene una lista paginada de usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/UsuarioResponse' } }
 *                     pagination: { type: object }
 *       403:
 *         description: No autorizado (solo ADMIN)
 */
router.get('/usuarios', verifyToken, checkRole(['ADMIN']), authController.getAllUsers);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.getUserById);

/**
 * @swagger
 * /api/v1/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       409:
 *         description: Email ya registrado
 */
router.post('/usuarios', verifyToken, checkRole(['ADMIN']), validate(registerValidations), authController.register);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               apellido: { type: string }
 *               telefono: { type: string }
 *               cedula: { type: string }
 *               email: { type: string, format: email }
 *               rolNombre: { type: string }
 *               descripcion: { type: string }
 *               especialidad: { type: string }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.updateUser);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/usuarios/:id', verifyToken, checkRole(['ADMIN']), authController.deleteUser);

// ==================== CRUD ROLES ====================

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/RolResponse' } }
 */
router.get('/roles', verifyToken, checkRole(['ADMIN']), rolController.getAllRoles);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 */
router.get('/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.getRolById);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Crear nuevo rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolRequest'
 *     responses:
 *       201:
 *         description: Rol creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolResponse'
 *       409:
 *         description: Rol ya existe
 */
router.post('/roles', verifyToken, checkRole(['ADMIN']), rolController.createRol);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Actualizar rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolRequest'
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       404:
 *         description: Rol no encontrado
 */
router.put('/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.updateRol);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Eliminar rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rol eliminado
 *       409:
 *         description: No se puede eliminar (tiene usuarios asociados)
 */
router.delete('/roles/:id', verifyToken, checkRole(['ADMIN']), rolController.deleteRol);

module.exports = router;