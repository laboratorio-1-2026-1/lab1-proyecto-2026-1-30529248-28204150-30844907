// src/routes/suscripcion.routes.js
const express = require('express');
const router = express.Router();
const suscripcionController = require('../controllers/suscripcion.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// ==================== PLANES DE SUSCRIPCIÓN ====================

/**
 * @swagger
 * /suscripciones/planes:
 *   get:
 *     summary: Listar todos los planes de suscripción
 *     tags: [Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *     responses:
 *       200:
 *         description: Lista de planes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/PlanSuscripcionResponse' } }
 *                     pagination: { type: object }
 */
router.get('/planes', verifyToken, suscripcionController.getAllSuscripciones);

/**
 * @swagger
 * /suscripciones/planes/{id}:
 *   get:
 *     summary: Obtener plan por ID
 *     tags: [Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plan encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanSuscripcionResponse'
 *       404:
 *         description: Plan no encontrado
 */
router.get('/planes/:id', verifyToken, suscripcionController.getSuscripcionById);

/**
 * @swagger
 * /suscripciones/planes:
 *   post:
 *     summary: Crear nuevo plan de suscripción
 *     tags: [Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanSuscripcionRequest'
 *     responses:
 *       201:
 *         description: Plan creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanSuscripcionResponse'
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.post('/planes', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.createSuscripcion);

/**
 * @swagger
 * /suscripciones/planes/{id}:
 *   put:
 *     summary: Actualizar plan de suscripción
 *     tags: [Planes de Suscripción]
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
 *             $ref: '#/components/schemas/PlanSuscripcionRequest'
 *     responses:
 *       200:
 *         description: Plan actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanSuscripcionResponse'
 *       404:
 *         description: Plan no encontrado
 */
router.put('/planes/:id', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.updateSuscripcion);

/**
 * @swagger
 * /suscripciones/planes/{id}:
 *   delete:
 *     summary: Eliminar plan de suscripción
 *     description: Solo se puede eliminar si no tiene membresías asociadas
 *     tags: [Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plan eliminado
 *       409:
 *         description: No se puede eliminar (tiene membresías asociadas)
 *       404:
 *         description: Plan no encontrado
 */
router.delete('/planes/:id', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.deleteSuscripcion);

// ==================== MEMBRESÍAS ====================

/**
 * @swagger
 * /suscripciones/clientes/{clienteId}/membresias:
 *   get:
 *     summary: Listar membresías de un cliente
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de membresías
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/clientes/:clienteId/membresias', verifyToken, suscripcionController.getMembresiasByCliente);

/**
 * @swagger
 * /suscripciones/clientes/{clienteId}/membresia-activa:
 *   get:
 *     summary: Obtener membresía activa de un cliente
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Membresía activa encontrada
 *       404:
 *         description: No tiene membresía activa
 */
router.get('/clientes/:clienteId/membresia-activa', verifyToken, suscripcionController.getMembresiaActivaByCliente);

/**
 * @swagger
 * /suscripciones/clientes/{clienteId}/verificar-acceso:
 *   get:
 *     summary: Verificar si un cliente tiene acceso (membresía activa)
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
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
 *                     activa: { type: boolean }
 *                     motivo: { type: string }
 *                     diasRestantes: { type: integer }
 */
router.get('/clientes/:clienteId/verificar-acceso', verifyToken, suscripcionController.verificarMembresiaActiva);

/**
 * @swagger
 * /suscripciones/membresias/{id}:
 *   get:
 *     summary: Obtener membresía por ID
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Membresía encontrada
 *       404:
 *         description: Membresía no encontrada
 */
router.get('/membresias/:id', verifyToken, suscripcionController.getMembresiaById);

/**
 * @swagger
 * /suscripciones/membresias:
 *   post:
 *     summary: Crear nueva membresía para un cliente
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - suscripcionId
 *             properties:
 *               clienteId: { type: integer, example: 1 }
 *               suscripcionId: { type: integer, example: 1 }
 *               fechaInicio: { type: string, format: date, example: "2024-01-01" }
 *     responses:
 *       201:
 *         description: Membresía creada
 *       404:
 *         description: Cliente o plan no encontrado
 */
router.post('/membresias', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.crearMembresia);

/**
 * @swagger
 * /suscripciones/membresias/{id}/renovar:
 *   post:
 *     summary: Renovar una membresía existente
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suscripcionId: { type: integer, description: "Opcional, si se quiere cambiar de plan" }
 *     responses:
 *       200:
 *         description: Membresía renovada
 *       404:
 *         description: Membresía no encontrada
 */
router.post('/membresias/:id/renovar', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.renovarMembresia);

// ==================== PAGOS ====================

/**
 * @swagger
 * /suscripciones/pagos:
 *   post:
 *     summary: Registrar un pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idMembresia
 *               - monto
 *               - metodoPago
 *             properties:
 *               idMembresia: { type: integer, example: 1 }
 *               monto: { type: number, example: 35.00 }
 *               metodoPago: { type: string, enum: [EFECTIVO, TRANSFERENCIA, TARJETA_CREDITO, TARJETA_DEBITO], example: "TRANSFERENCIA" }
 *     responses:
 *       201:
 *         description: Pago registrado
 *       404:
 *         description: Membresía no encontrada
 */
router.post('/pagos', verifyToken, checkRole(['ADMIN', 'FINANZAS']), suscripcionController.registrarPago);

/**
 * @swagger
 * /suscripciones/membresias/{membresiaId}/pagos:
 *   get:
 *     summary: Listar pagos de una membresía
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membresiaId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/membresias/:membresiaId/pagos', verifyToken, suscripcionController.getPagosByMembresia);

/**
 * @swagger
 * /suscripciones/clientes/{clienteId}/pagos:
 *   get:
 *     summary: Listar todos los pagos de un cliente
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/clientes/:clienteId/pagos', verifyToken, suscripcionController.getPagosByCliente);

module.exports = router;