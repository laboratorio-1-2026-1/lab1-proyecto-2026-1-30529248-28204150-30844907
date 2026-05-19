const express = require('express');
const router = express.Router();
const deportivoController = require('../controllers/deportivo.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// ==================== DISCIPLINAS ====================

/**
 * @swagger
 * /api/v1/deportivo/disciplinas:
 *   get:
 *     summary: Listar todas las disciplinas
 *     tags: [Gestión Deportiva - Disciplinas]
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
 *         description: Lista de disciplinas
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
 *                           nombre: { type: string }
 *                           descripcion: { type: string }
 *                     pagination: { type: object }
 */
router.get('/disciplinas', verifyToken, deportivoController.getAllDisciplinas);

/**
 * @swagger
 * /api/v1/deportivo/disciplinas/{id}:
 *   get:
 *     summary: Obtener disciplina por ID
 *     tags: [Gestión Deportiva - Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Disciplina encontrada
 *       404:
 *         description: Disciplina no encontrada
 */
router.get('/disciplinas/:id', verifyToken, deportivoController.getDisciplinaById);

/**
 * @swagger
 * /api/v1/deportivo/disciplinas:
 *   post:
 *     summary: Crear nueva disciplina
 *     tags: [Gestión Deportiva - Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre: { type: string, example: "Spinning" }
 *               descripcion: { type: string, example: "Ciclismo indoor" }
 *     responses:
 *       201:
 *         description: Disciplina creada
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.post('/disciplinas', verifyToken, checkRole(['ADMIN']), deportivoController.createDisciplina);

/**
 * @swagger
 * /api/v1/deportivo/disciplinas/{id}:
 *   put:
 *     summary: Actualizar disciplina
 *     tags: [Gestión Deportiva - Disciplinas]
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
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       200:
 *         description: Disciplina actualizada
 *       404:
 *         description: Disciplina no encontrada
 */
router.put('/disciplinas/:id', verifyToken, checkRole(['ADMIN']), deportivoController.updateDisciplina);

/**
 * @swagger
 * /api/v1/deportivo/disciplinas/{id}:
 *   delete:
 *     summary: Eliminar disciplina
 *     tags: [Gestión Deportiva - Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Disciplina eliminada
 *       409:
 *         description: No se puede eliminar (tiene sesiones asociadas)
 *       404:
 *         description: Disciplina no encontrada
 */
router.delete('/disciplinas/:id', verifyToken, checkRole(['ADMIN']), deportivoController.deleteDisciplina);

// ==================== ENTRENADORES ====================

/**
 * @swagger
 * /api/v1/deportivo/entrenadores:
 *   get:
 *     summary: Listar todos los entrenadores
 *     tags: [Gestión Deportiva - Entrenadores]
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
 *         description: Lista de entrenadores
 */
router.get('/entrenadores', verifyToken, deportivoController.getAllEntrenadores);

/**
 * @swagger
 * /api/v1/deportivo/entrenadores/{id}:
 *   get:
 *     summary: Obtener entrenador por ID
 *     tags: [Gestión Deportiva - Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entrenador encontrado
 *       404:
 *         description: Entrenador no encontrado
 */
router.get('/entrenadores/:id', verifyToken, deportivoController.getEntrenadorById);

/**
 * @swagger
 * /api/v1/deportivo/entrenadores:
 *   post:
 *     summary: Registrar un usuario como entrenador
 *     tags: [Gestión Deportiva - Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *             properties:
 *               idUsuario: { type: integer, example: 5 }
 *               especialidad: { type: string, example: "Yoga y Pilates" }
 *     responses:
 *       201:
 *         description: Entrenador registrado
 *       400:
 *         description: El usuario no tiene rol ENTRENADOR
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/entrenadores', verifyToken, checkRole(['ADMIN']), deportivoController.createEntrenador);

/**
 * @swagger
 * /api/v1/deportivo/entrenadores/{id}:
 *   put:
 *     summary: Actualizar entrenador
 *     tags: [Gestión Deportiva - Entrenadores]
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
 *               especialidad: { type: string, example: "Crossfit Avanzado" }
 *     responses:
 *       200:
 *         description: Entrenador actualizado
 *       404:
 *         description: Entrenador no encontrado
 */
router.put('/entrenadores/:id', verifyToken, checkRole(['ADMIN']), deportivoController.updateEntrenador);

/**
 * @swagger
 * /api/v1/deportivo/entrenadores/{id}:
 *   delete:
 *     summary: Eliminar entrenador
 *     tags: [Gestión Deportiva - Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entrenador eliminado
 *       409:
 *         description: No se puede eliminar (tiene sesiones asignadas)
 *       404:
 *         description: Entrenador no encontrado
 */
router.delete('/entrenadores/:id', verifyToken, checkRole(['ADMIN']), deportivoController.deleteEntrenador);

// ==================== SESIONES ====================

/**
 * @swagger
 * /api/v1/deportivo/sesiones:
 *   get:
 *     summary: Listar todas las sesiones de clase
 *     tags: [Gestión Deportiva - Sesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: disciplinaId
 *         schema: { type: integer }
 *         description: Filtrar por disciplina
 *       - in: query
 *         name: entrenadorId
 *         schema: { type: integer }
 *         description: Filtrar por entrenador
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA] }
 *         description: Filtrar por estado
 *       - in: query
 *         name: fecha
 *         schema: { type: string, format: date }
 *         description: Filtrar por fecha (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de sesiones
 */
router.get('/sesiones', verifyToken, deportivoController.getAllSesiones);

/**
 * @swagger
 * /api/v1/deportivo/sesiones/{id}:
 *   get:
 *     summary: Obtener sesión por ID
 *     tags: [Gestión Deportiva - Sesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sesión encontrada
 *       404:
 *         description: Sesión no encontrada
 */
router.get('/sesiones/:id', verifyToken, deportivoController.getSesionById);

/**
 * @swagger
 * /api/v1/deportivo/sesiones:
 *   post:
 *     summary: Crear nueva sesión de clase
 *     tags: [Gestión Deportiva - Sesiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idDisciplina
 *               - idEntrenador
 *               - fecha
 *               - horaInicio
 *               - horaFin
 *             properties:
 *               idDisciplina: { type: integer, example: 1 }
 *               idEntrenador: { type: integer, example: 1 }
 *               fecha: { type: string, format: date, example: "2024-12-20" }
 *               horaInicio: { type: string, example: "10:00" }
 *               horaFin: { type: string, example: "11:00" }
 *               limiteDeCupos: { type: integer, example: 20 }
 *     responses:
 *       201:
 *         description: Sesión creada
 *       409:
 *         description: Solapamiento de horario con entrenador
 *       404:
 *         description: Disciplina o entrenador no encontrado
 */
router.post('/sesiones', verifyToken, checkRole(['ADMIN']), deportivoController.createSesion);

/**
 * @swagger
 * /api/v1/deportivo/sesiones/{id}:
 *   put:
 *     summary: Actualizar sesión
 *     tags: [Gestión Deportiva - Sesiones]
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
 *               idDisciplina: { type: integer }
 *               idEntrenador: { type: integer }
 *               fecha: { type: string, format: date }
 *               horaInicio: { type: string }
 *               horaFin: { type: string }
 *               limiteDeCupos: { type: integer }
 *               estado: { type: string, enum: [PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA] }
 *     responses:
 *       200:
 *         description: Sesión actualizada
 *       404:
 *         description: Sesión no encontrada
 */
router.put('/sesiones/:id', verifyToken, checkRole(['ADMIN']), deportivoController.updateSesion);

/**
 * @swagger
 * /api/v1/deportivo/sesiones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una sesión
 *     tags: [Gestión Deportiva - Sesiones]
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
 *             required:
 *               - estado
 *             properties:
 *               estado: { type: string, enum: [PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA], example: "EN_CURSO" }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Sesión no encontrada
 */
router.patch('/sesiones/:id/estado', verifyToken, checkRole(['ADMIN']), deportivoController.cambiarEstadoSesion);

/**
 * @swagger
 * /api/v1/deportivo/sesiones/{id}:
 *   delete:
 *     summary: Eliminar sesión
 *     tags: [Gestión Deportiva - Sesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sesión eliminada
 *       409:
 *         description: No se puede eliminar (tiene reservas asociadas)
 *       404:
 *         description: Sesión no encontrada
 */
router.delete('/sesiones/:id', verifyToken, checkRole(['ADMIN']), deportivoController.deleteSesion);

module.exports = router;