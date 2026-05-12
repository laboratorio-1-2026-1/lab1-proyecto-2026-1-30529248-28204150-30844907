// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

// ==================== Validaciones ====================

const loginValidations = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

const registerValidations = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('idRol')
    .notEmpty().withMessage('El rol es requerido')
    .isInt().withMessage('idRol debe ser un número entero')
];

const assignRoleValidations = [
  body('rolId')
    .notEmpty().withMessage('rolId es requerido')
    .isInt().withMessage('rolId debe ser un número entero')
];

// ==================== Rutas Públicas ====================

router.post('/login', validate(loginValidations), authController.login);
router.post('/register', validate(registerValidations), authController.register);

// ==================== Rutas Protegidas ====================

router.get('/me', verifyToken, authController.getProfile);

// Rutas solo para ADMIN
router.get('/usuarios', verifyToken, checkRole(['Administrador']), authController.getAllUsers);
router.get('/usuarios/:id', verifyToken, checkRole(['Administrador']), authController.getUserById);
router.put('/usuarios/:id', verifyToken, checkRole(['Administrador']), authController.updateUser);
router.delete('/usuarios/:id', verifyToken, checkRole(['Administrador']), authController.deleteUser);
router.post('/usuarios/:id/roles', verifyToken, checkRole(['Administrador']), validate(assignRoleValidations), authController.assignRole);
router.get('/roles', verifyToken, checkRole(['Administrador']), authController.getAllRoles);

module.exports = router;