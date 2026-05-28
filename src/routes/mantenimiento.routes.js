const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');


// ==================== TICKETS ====================

/**
 * @swagger
 * /api/v1/mantenimiento/tickets:
 *   get:
 *     summary: Listar tickets de mantenimiento
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: maquinaId
 *         schema: { type: integer }
 *         description: Filtrar por máquina
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [ABIERTO, RESUELTO] }
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de tickets
 *       403:
 *         description: No autorizado (requiere ADMIN o MANTENIMIENTO)
 */
router.get('/tickets', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.getAllTickets);

/**
 * @swagger
 * /api/v1/mantenimiento/tickets/{id}:
 *   get:
 *     summary: Obtener ticket por ID
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ticket encontrado
 *       404:
 *         description: Ticket no encontrado
 */
router.get('/tickets/:id', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.getTicketById);

/**
 * @swagger
 * /api/v1/mantenimiento/maquinas/{maquinaId}/tickets:
 *   get:
 *     summary: Listar tickets de una máquina
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maquinaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Historial de tickets de la máquina
 */
router.get('/maquinas/:maquinaId/tickets', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.getTicketsByMaquina);

/**
 * @swagger
 * /api/v1/mantenimiento/tickets:
 *   post:
 *     summary: Crear ticket de mantenimiento
 *     description: Abre un ticket y cambia automáticamente el estado de la máquina a MANTENIMIENTO
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idMaquina
 *               - descripcionFalla
 *             properties:
 *               idMaquina:
 *                 type: integer
 *                 example: 1
 *               descripcionFalla:
 *                 type: string
 *                 example: "Ruido extraño en la banda"
 *     responses:
 *       201:
 *         description: Ticket creado
 *       404:
 *         description: Máquina no encontrada
 */
router.post('/tickets', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.crearTicket);

/**
 * @swagger
 * /api/v1/mantenimiento/tickets/{id}/resolver:
 *   put:
 *     summary: Resolver ticket de mantenimiento
 *     description: Cierra el ticket y cambia el estado de la máquina a ACTIVA
 *     tags: [Mantenimiento]
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
 *               costoReparacion:
 *                 type: number
 *                 example: 150.00
 *               descripcionResolucion:
 *                 type: string
 *                 example: "Se cambió la banda"
 *     responses:
 *       200:
 *         description: Ticket resuelto
 *       409:
 *         description: Ticket ya estaba resuelto
 */
router.put('/tickets/:id/resolver', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.resolverTicket);

/**
 * @swagger
 * /api/v1/mantenimiento/tickets/{id}:
 *   delete:
 *     summary: Cancelar ticket
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ticket cancelado
 *       409:
 *         description: No se puede cancelar un ticket ya resuelto
 */
router.delete('/tickets/:id', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), mantenimientoController.cancelarTicket);

// ==================== REPORTES ====================

/**
 * @swagger
 * /api/v1/mantenimiento/reportes/maquina/{maquinaId}:
 *   get:
 *     summary: Reporte de mantenimiento por máquina
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maquinaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reporte detallado de la máquina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 maquina: { type: object }
 *                 tickets: { type: array }
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalTickets: { type: integer }
 *                     ticketsAbiertos: { type: integer }
 *                     ticketsResueltos: { type: integer }
 *                     costoTotalMantenimiento: { type: number }
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.get('/reportes/maquina/:maquinaId', verifyToken, checkRole(['ADMIN', 'FINANZAS']), mantenimientoController.getReportePorMaquina);

/**
 * @swagger
 * /api/v1/mantenimiento/reportes/general:
 *   get:
 *     summary: Reporte general de mantenimiento
 *     tags: [Mantenimiento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fechaFin
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Reporte general de mantenimiento
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.get('/reportes/general', verifyToken, checkRole(['ADMIN', 'FINANZAS']), mantenimientoController.getReporteGeneral);

module.exports = router;