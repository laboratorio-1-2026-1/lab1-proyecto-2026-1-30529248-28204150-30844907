// src/controllers/tienda.controller.js
const tiendaService = require('../services/tienda.service');
const { HTTP_STATUS } = require('../config/constantes');

class TiendaController {
  
  async getAllProductos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filtros = { nombre: req.query.nombre, stockMinimo: req.query.stockMinimo, conStock: req.query.conStock, sinStock: req.query.sinStock };
      const result = await tiendaService.getAllProductos(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getProductoById(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await tiendaService.getProductoById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: producto });
    } catch (error) { return next(error); }
  }
  
  async createProducto(req, res, next) {
    try {
      const nuevoProducto = await tiendaService.createProducto(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Producto creado', data: nuevoProducto });
    } catch (error) { return next(error); }
  }
  
  async updateProducto(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await tiendaService.updateProducto(id, req.body);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Producto actualizado', data: producto });
    } catch (error) { return next(error); }
  }
  
  async deleteProducto(req, res, next) {
    try {
      const { id } = req.params;
      const result = await tiendaService.deleteProducto(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
    } catch (error) { return next(error); }
  }
  
  async ajustarStock(req, res, next) {
    try {
      const { id } = req.params;
      const { cantidad, operacion } = req.body;
      const producto = await tiendaService.ajustarStock(id, cantidad, operacion);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: `Stock ${operacion === 'sumar' ? 'incrementado' : 'reducido'}`, data: producto });
    } catch (error) { return next(error); }
  }
  
  async getAllVentas(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await tiendaService.getAllVentas(page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getVentasByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await tiendaService.getVentasByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getVentaById(req, res, next) {
    try {
      const { id } = req.params;
      const venta = await tiendaService.getVentaById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: venta });
    } catch (error) { return next(error); }
  }
  
  async crearVenta(req, res, next) {
    try {
      const venta = await tiendaService.crearVenta(req.body, req.user.id);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Venta registrada', data: venta });
    } catch (error) { return next(error); }
  }
  
  async cancelarVenta(req, res, next) {
    try {
      const { id } = req.params;
      const result = await tiendaService.cancelarVenta(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
    } catch (error) { return next(error); }
  }
  
  async getReporteVentas(req, res, next) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const reporte = await tiendaService.getReporteVentas(fechaInicio, fechaFin);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: reporte });
    } catch (error) { return next(error); }
  }
}

module.exports = new TiendaController();