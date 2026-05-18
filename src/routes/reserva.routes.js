const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// ==================== CLIENTE (Rutas públicas para usuario autenticado) ====================

/**
 * @swagger
 * /reservas/disponibilidad:
 *   get:
 *     summary: Consultar sesiones disponibles para reservar
 *     description: Retorna las sesiones con cupos disponibles, aplicando filtros opcionales
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema: { type: string, format: date, example: "2024-12-20" }
 *         description: Filtrar por fecha específica
 *       - in: query
 *         name: disciplinaId
 *         schema: { type: integer, example: 1 }
 *         description: Filtrar por disciplina
 *       - in: query
 *         name: entrenadorId
 *         schema: { type: integer, example: 1 }
 *         description: Filtrar por entrenador
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de sesiones disponibles
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
 *                           idDisciplina: { type: integer }
 *                           idEntrenador: { type: integer }
 *                           fecha: { type: string, format: date }
 *                           horaInicio: { type: string }
 *                           horaFin: { type: string }
 *                           limiteDeCupos: { type: integer }
 *                           cuposOcupados: { type: integer }
 *                           cuposDisponibles: { type: integer }
 *                           hayCupos: { type: boolean }
 *                           disciplina: { type: object }
 *                           entrenador: { type: object }
 *                     pagination: { type: object }
 *       401:
 *         description: No autorizado
 */
router.get('/disponibilidad', verifyToken, reservaController.getSesionesDisponibles);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     description: Un cliente puede reservar una sesión si hay cupos disponibles y no tiene conflicto de horario
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sesionId
 *             properties:
 *               sesionId: { type: integer, example: 1, description: "ID de la sesión a reservar" }
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       409:
 *         description: Sin cupos disponibles o solapamiento de horario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Conflict" }
 *                 codigoInterno: { type: string, example: "SIN_CUPOS" }
 *                 mensaje: { type: string }
 *       404:
 *         description: Sesión no encontrada
 */
router.post('/', verifyToken, reservaController.crearReserva);

/**
 * @swagger
 * /reservas/mis-reservas:
 *   get:
 *     summary: Ver mis reservas activas
 *     description: Retorna todas las reservas activas del cliente autenticado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de reservas del cliente
 *       401:
 *         description: No autorizado
 */
router.get('/mis-reservas', verifyToken, reservaController.getMisReservas);

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Cancelar mi reserva
 *     description: Un cliente puede cancelar su propia reserva (si no ha pasado la sesión)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la reserva a cancelar
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       403:
 *         description: No autorizado (la reserva no te pertenece)
 *       404:
 *         description: Reserva no encontrada
 *       409:
 *         description: La reserva ya está cancelada o la sesión ya pasó
 */
router.delete('/:id', verifyToken, reservaController.cancelarReserva);

// ==================== ADMIN (Rutas solo para administradores) ====================

/**
 * @swagger
 * /reservas/cliente/{clienteId}:
 *   get:
 *     summary: Ver reservas de un cliente (ADMIN)
 *     tags: [Reservas - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *         description: ID del cliente
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de reservas del cliente
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.get('/cliente/:clienteId', verifyToken, checkRole(['ADMIN']), reservaController.getReservasByCliente);

/**
 * @swagger
 * /reservas/cliente/{clienteId}/historial:
 *   get:
 *     summary: Ver historial completo de reservas de un cliente (ADMIN)
 *     description: Incluye reservas activas y canceladas
 *     tags: [Reservas - Admin]
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
 *         description: Historial completo de reservas
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.get('/cliente/:clienteId/historial', verifyToken, checkRole(['ADMIN']), reservaController.getHistorialReservas);

/**
 * @swagger
 * /reservas/admin/{id}:
 *   delete:
 *     summary: Cancelar cualquier reserva (ADMIN)
 *     description: Un administrador puede cancelar cualquier reserva sin restricciones
 *     tags: [Reservas - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la reserva a cancelar
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/admin/:id', verifyToken, checkRole(['ADMIN']), reservaController.cancelarReservaAdmin);

module.exports = router;