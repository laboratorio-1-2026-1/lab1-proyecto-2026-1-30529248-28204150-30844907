// src/routes/maquina.routes.js
const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquina.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// ==================== MÁQUINAS ====================

/**
 * @swagger
 * /api/v1/maquinas:
 *   get:
 *     summary: Listar todas las máquinas
 *     description: Obtiene una lista paginada de máquinas con filtros opcionales
 *     tags: [Máquinas]
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
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [ACTIVA, MANTENIMIENTO, FUERA_SERVICIO] }
 *         description: Filtrar por estado
 *       - in: query
 *         name: categoriaId
 *         schema: { type: integer }
 *         description: Filtrar por categoría
 *       - in: query
 *         name: nombre
 *         schema: { type: string }
 *         description: Filtrar por nombre (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Lista de máquinas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaListResponse'
 *       401:
 *         description: No autorizado
 */
router.get('/', verifyToken, maquinaController.getAllMaquinas);

// Nota: `GET /:id` se moverá más abajo para evitar conflicto con rutas estáticas como `/categorias` y `/codigo/:codigo`

/**
 * @swagger
 * /api/v1/maquinas/codigo/{codigo}:
 *   get:
 *     summary: Obtener máquina por código
 *     tags: [Máquinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Máquina encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       404:
 *         description: Máquina no encontrada
 */
router.get('/codigo/:codigo', verifyToken, maquinaController.getMaquinaByCodigo);

/**
 * @swagger
 * /api/v1/maquinas:
 *   post:
 *     summary: Crear nueva máquina
 *     tags: [Máquinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaquinaRequest'
 *     responses:
 *       201:
 *         description: Máquina creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       409:
 *         description: El código ya existe
 *       404:
 *         description: Categoría no encontrada
 */
router.post('/', verifyToken, checkRole(['ADMIN']), maquinaController.createMaquina);

/**
 * @swagger
 * /api/v1/maquinas/{id}:
 *   put:
 *     summary: Actualizar máquina
 *     tags: [Máquinas]
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
 *             $ref: '#/components/schemas/MaquinaRequest'
 *     responses:
 *       200:
 *         description: Máquina actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       404:
 *         description: Máquina no encontrada
 *       409:
 *         description: El código ya existe
 */
router.put('/:id', verifyToken, checkRole(['ADMIN']), maquinaController.updateMaquina);

/**
 * @swagger
 * /api/v1/maquinas/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una máquina
 *     description: Permite cambiar el estado operativo de una máquina
 *     tags: [Máquinas]
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
 *             $ref: '#/components/schemas/EstadoUpdateRequest'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       404:
 *         description: Máquina no encontrada
 *       403:
 *         description: No autorizado (requiere ADMIN o MANTENIMIENTO)
 */
router.patch('/:id/estado', verifyToken, checkRole(['ADMIN', 'MANTENIMIENTO']), maquinaController.cambiarEstado);

/**
 * @swagger
 * /api/v1/maquinas/{id}:
 *   delete:
 *     summary: Eliminar máquina (soft delete)
 *     description: Cambia el estado de la máquina a FUERA_SERVICIO
 *     tags: [Máquinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Máquina eliminada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       404:
 *         description: Máquina no encontrada
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.delete('/:id', verifyToken, checkRole(['ADMIN']), maquinaController.deleteMaquina);

// ==================== CATEGORÍAS ====================

/**
 * @swagger
 * /api/v1/maquinas/categorias:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categorías de Máquinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/CategoriaResponse' } }
 */
router.get('/categorias', verifyToken, maquinaController.getAllCategorias);

/**
 * @swagger
 * /api/v1/maquinas/categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categorías de Máquinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/categorias/:id', verifyToken, maquinaController.getCategoriaById);

/**
 * @swagger
 * /api/v1/maquinas/categorias:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Categorías de Máquinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaRequest'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *       409:
 *         description: La categoría ya existe
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
router.post('/categorias', verifyToken, checkRole(['ADMIN']), maquinaController.createCategoria);

/**
 * @swagger
 * /api/v1/maquinas/categorias/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Categorías de Máquinas]
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
 *             $ref: '#/components/schemas/CategoriaRequest'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *       404:
 *         description: Categoría no encontrada
 *       409:
 *         description: El nombre ya existe
 */
router.put('/categorias/:id', verifyToken, checkRole(['ADMIN']), maquinaController.updateCategoria);

/**
 * @swagger
 * /api/v1/maquinas/categorias/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     description: Solo se puede eliminar si no tiene máquinas asociadas
 *     tags: [Categorías de Máquinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       409:
 *         description: No se puede eliminar (tiene máquinas asociadas)
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/categorias/:id', verifyToken, checkRole(['ADMIN']), maquinaController.deleteCategoria);

/**
 * @swagger
 * /api/v1/maquinas/{id}:
 *   get:
 *     summary: Obtener máquina por ID
 *     tags: [Máquinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Máquina encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaquinaResponse'
 *       404:
 *         description: Máquina no encontrada
 */
router.get('/:id', verifyToken, maquinaController.getMaquinaById);

module.exports = router;