const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tienda.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');


// ==================== PRODUCTOS ====================

/**
 * @swagger
 * /api/v1/tienda/productos:
 *   get:
 *     summary: Listar productos
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: nombre
 *         schema: { type: string }
 *         description: Buscar por nombre
 *       - in: query
 *         name: conStock
 *         schema: { type: boolean }
 *         description: Solo productos con stock > 0
 *       - in: query
 *         name: sinStock
 *         schema: { type: boolean }
 *         description: Solo productos sin stock
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/productos', verifyToken, tiendaController.getAllProductos);

/**
 * @swagger
 * /api/v1/tienda/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/productos/:id', verifyToken, tiendaController.getProductoById);

/**
 * @swagger
 * /api/v1/tienda/productos:
 *   post:
 *     summary: Crear producto
 *     tags: [Tienda (POS)]
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
 *               - precio
 *             properties:
 *               nombre: { type: string, example: "Proteína Whey" }
 *               descripcion: { type: string, example: "Suplemento proteico" }
 *               precio: { type: number, example: 45.00 }
 *               stock: { type: integer, example: 20 }
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.post('/productos', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.createProducto);

/**
 * @swagger
 * /api/v1/tienda/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Tienda (POS)]
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
 *               precio: { type: number }
 *               stock: { type: integer }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.put('/productos/:id', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.updateProducto);

/**
 * @swagger
 * /api/v1/tienda/productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       409:
 *         description: No se puede eliminar (tiene ventas asociadas)
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.delete('/productos/:id', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.deleteProducto);

/**
 * @swagger
 * /api/v1/tienda/productos/{id}/stock:
 *   patch:
 *     summary: Ajustar stock manualmente
 *     tags: [Tienda (POS)]
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
 *               - cantidad
 *               - operacion
 *             properties:
 *               cantidad: { type: integer, example: 5 }
 *               operacion: { type: string, enum: [sumar, restar], example: "sumar" }
 *     responses:
 *       200:
 *         description: Stock ajustado
 *       409:
 *         description: Stock insuficiente
 */
router.patch('/productos/:id/stock', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.ajustarStock);

// ==================== VENTAS ====================

/**
 * @swagger
 * /api/v1/tienda/ventas:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Tienda (POS)]
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
 *         description: Lista de ventas
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.get('/ventas', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.getAllVentas);

/**
 * @swagger
 * /api/v1/tienda/ventas/cliente/{clienteId}:
 *   get:
 *     summary: Listar ventas de un cliente
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de ventas del cliente
 */
router.get('/ventas/cliente/:clienteId', verifyToken, tiendaController.getVentasByCliente);

/**
 * @swagger
 * /api/v1/tienda/ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: Venta no encontrada
 */
router.get('/ventas/:id', verifyToken, tiendaController.getVentaById);

/**
 * @swagger
 * /api/v1/tienda/ventas:
 *   post:
 *     summary: Registrar nueva venta (POS)
 *     description: Registra una venta de productos y actualiza el stock automáticamente
 *     tags: [Tienda (POS)]
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
 *               - items
 *             properties:
 *               idCliente:
 *                 type: integer
 *                 example: 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idProducto
 *                     - cantidad
 *                   properties:
 *                     idProducto: { type: integer, example: 1 }
 *                     cantidad: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Venta registrada
 *       409:
 *         description: Stock insuficiente
 *       403:
 *         description: No autorizado (requiere ADMIN, FINANZAS o RECEPCIONISTA)
 */
router.post('/ventas', verifyToken, checkRole(['ADMIN', 'FINANZAS', 'RECEPCIONISTA']), tiendaController.crearVenta);

/**
 * @swagger
 * /api/v1/tienda/ventas/{id}:
 *   delete:
 *     summary: Cancelar venta
 *     description: Cancela una venta y restaura el stock de los productos
 *     tags: [Tienda (POS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Venta cancelada
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 *       404:
 *         description: Venta no encontrada
 */
router.delete('/ventas/:id', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.cancelarVenta);

// ==================== REPORTES ====================

/**
 * @swagger
 * /api/v1/tienda/reportes/ventas:
 *   get:
 *     summary: Reporte de ventas
 *     description: Genera un reporte con resumen de ventas y productos más vendidos
 *     tags: [Tienda (POS)]
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
 *         description: Reporte de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalVentas: { type: number }
 *                     cantidadVentas: { type: integer }
 *                     ticketPromedio: { type: number }
 *                 productosMasVendidos: { type: array }
 *                 ventas: { type: array }
 *       403:
 *         description: No autorizado (requiere ADMIN o FINANZAS)
 */
router.get('/reportes/ventas', verifyToken, checkRole(['ADMIN', 'FINANZAS']), tiendaController.getReporteVentas);

module.exports = router;