// src/routes/biometrico.routes.js
const express = require('express');
const router = express.Router();
const biometricoController = require('../controllers/biometrico.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');


/**
 * @swagger
 * /api/v1/biometrico/evaluaciones:
 *   post:
 *     summary: Registrar evaluación biométrica
 *     description: Los entrenadores pueden registrar evaluaciones físicas de los clientes
 *     tags: [Seguimiento Biométrico]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idCliente
 *               - idEntrenador
 *               - peso
 *               - estatura
 *             properties:
 *               idCliente:
 *                 type: integer
 *                 example: 1
 *                 description: ID del cliente
 *               idEntrenador:
 *                 type: integer
 *                 example: 1
 *                 description: ID del entrenador
 *               peso:
 *                 type: number
 *                 example: 75.5
 *                 description: Peso en kg
 *               estatura:
 *                 type: number
 *                 example: 1.75
 *                 description: Estatura en metros
 *               porcentajeGrasa:
 *                 type: number
 *                 example: 18.5
 *                 description: Porcentaje de grasa corporal
 *               observaciones:
 *                 type: string
 *                 example: "Buena evolución"
 *                 description: Observaciones adicionales
 *     responses:
 *       201:
 *         description: Evaluación registrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado (requiere ENTRENADOR o ADMIN)
 *       404:
 *         description: Cliente o entrenador no encontrado
 */
router.post('/evaluaciones', verifyToken, checkRole(['ENTRENADOR', 'ADMIN']), biometricoController.registrarEvaluacion);

/**
 * @swagger
 * /api/v1/biometrico/cliente/{clienteId}/historial:
 *   get:
 *     summary: Obtener historial de evaluaciones
 *     description: Lista todas las evaluaciones de un cliente en orden cronológico
 *     tags: [Seguimiento Biométrico]
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
 *         description: Historial de evaluaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           peso: { type: number }
 *                           estatura: { type: number }
 *                           porcentajeGrasa: { type: number }
 *                           observaciones: { type: string }
 *                           fechaEvaluacion: { type: string, format: date-time }
 *                           evolucion: { type: object }
 *                     pagination: { type: object }
 */
router.get('/cliente/:clienteId/historial', verifyToken, biometricoController.getHistorialByCliente);

/**
 * @swagger
 * /api/v1/biometrico/cliente/{clienteId}/ultima:
 *   get:
 *     summary: Obtener última evaluación
 *     tags: [Seguimiento Biométrico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Última evaluación del cliente
 *       404:
 *         description: No hay evaluaciones
 */
router.get('/cliente/:clienteId/ultima', verifyToken, biometricoController.getUltimaEvaluacion);

/**
 * @swagger
 * /api/v1/biometrico/cliente/{clienteId}/progreso:
 *   get:
 *     summary: Obtener resumen de progreso
 *     description: Compara primera y última evaluación del cliente
 *     tags: [Seguimiento Biométrico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Resumen de progreso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 primeraEvaluacion: { type: object }
 *                 ultimaEvaluacion: { type: object }
 *                 progreso:
 *                   type: object
 *                   properties:
 *                     peso: { type: number }
 *                     porcentajeGrasa: { type: number }
 *                     periodoDias: { type: integer }
 */
router.get('/cliente/:clienteId/progreso', verifyToken, biometricoController.getResumenProgreso);

/**
 * @swagger
 * /api/v1/biometrico/evaluaciones/{id}:
 *   get:
 *     summary: Obtener evaluación por ID
 *     tags: [Seguimiento Biométrico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Evaluación encontrada
 *       404:
 *         description: Evaluación no encontrada
 */
router.get('/evaluaciones/:id', verifyToken, biometricoController.getEvaluacionById);

/**
 * @swagger
 * /api/v1/biometrico/evaluaciones/{id}:
 *   put:
 *     summary: Actualizar evaluación
 *     tags: [Seguimiento Biométrico]
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
 *               peso: { type: number }
 *               estatura: { type: number }
 *               porcentajeGrasa: { type: number }
 *               observaciones: { type: string }
 *     responses:
 *       200:
 *         description: Evaluación actualizada
 *       403:
 *         description: No autorizado (requiere ENTRENADOR o ADMIN)
 */
router.put('/evaluaciones/:id', verifyToken, checkRole(['ENTRENADOR', 'ADMIN']), biometricoController.updateEvaluacion);

/**
 * @swagger
 * /api/v1/biometrico/evaluaciones/{id}:
 *   delete:
 *     summary: Eliminar evaluación
 *     tags: [Seguimiento Biométrico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Evaluación eliminada
 *       403:
 *         description: No autorizado (requiere ENTRENADOR o ADMIN)
 */
router.delete('/evaluaciones/:id', verifyToken, checkRole(['ENTRENADOR', 'ADMIN']), biometricoController.deleteEvaluacion);

module.exports = router;