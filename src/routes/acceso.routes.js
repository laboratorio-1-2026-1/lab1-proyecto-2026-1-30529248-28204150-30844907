const express = require('express');
const router = express.Router();
const accesoController = require('../controllers/acceso.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');


/**
 * @swagger
 * /acceso/entrada:
 *   post:
 *     summary: Registrar entrada por cédula (torniquete/recepción)
 *     description: Registra el ingreso de una persona al gimnasio y valida su membresía
 *     tags: [Control de Acceso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cedula
 *             properties:
 *               cedula:
 *                 type: string
 *                 example: "V-12345678"
 *                 description: Número de cédula del cliente
 *     responses:
 *       200:
 *         description: Acceso registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Acceso registrado exitosamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     acceso:
 *                       type: object
 *                     cliente:
 *                       type: object
 *                     membresia:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: Sin membresía activa o usuario inactivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Conflict" }
 *                 codigoInterno: { type: string, example: "SIN_MEMBRESIA" }
 *                 mensaje: { type: string }
 *                 timestamp: { type: string }
 */
router.post('/entrada', verifyToken, checkRole(['ADMIN', 'RECEPCIONISTA']), accesoController.registrarEntrada);

/**
 * @swagger
 * /acceso/verificar/{cedula}:
 *   get:
 *     summary: Verificar acceso sin registrar
 *     description: Verifica si un cliente puede acceder (sin registrar entrada)
 *     tags: [Control de Acceso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema: { type: string }
 *         description: Número de cédula del cliente
 *     responses:
 *       200:
 *         description: Resultado de verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accesoPermitido: { type: boolean }
 *                     motivo: { type: string }
 *                     cliente: { type: object }
 *                     membresia: { type: object }
 */
router.get('/verificar/:cedula', verifyToken, checkRole(['ADMIN', 'RECEPCIONISTA']), accesoController.verificarAcceso);

/**
 * @swagger
 * /acceso/bitacora:
 *   get:
 *     summary: Obtener bitácora de accesos
 *     description: Lista todos los intentos de acceso (solo ADMIN)
 *     tags: [Control de Acceso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema: { type: integer }
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: estadoAcceso
 *         schema: { type: string, enum: [PERMITIDO, DENEGADO] }
 *         description: Filtrar por estado
 *       - in: query
 *         name: fechaInicio
 *         schema: { type: string, format: date }
 *         description: Fecha de inicio
 *       - in: query
 *         name: fechaFin
 *         schema: { type: string, format: date }
 *         description: Fecha de fin
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Bitácora de accesos
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.get('/bitacora', verifyToken, checkRole(['ADMIN']), accesoController.getBitacoraAccesos);

/**
 * @swagger
 * /acceso/cliente/{clienteId}:
 *   get:
 *     summary: Obtener accesos de un cliente
 *     tags: [Control de Acceso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Historial de accesos del cliente
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.get('/cliente/:clienteId', verifyToken, checkRole(['ADMIN']), accesoController.getAccesosByCliente);

module.exports = router;