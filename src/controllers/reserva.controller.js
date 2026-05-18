// src/controllers/reserva.controller.js
const reservaService = require('../services/reserva.service');
const { HTTP_STATUS } = require('../config/constantes');

class ReservaController {
  
  async getSesionesDisponibles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filtros = { fecha: req.query.fecha, disciplinaId: req.query.disciplinaId, entrenadorId: req.query.entrenadorId };
      const result = await reservaService.getSesionesDisponibles(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async crearReserva(req, res, next) {
    try {
      const { sesionId } = req.body;
      const reserva = await reservaService.crearReserva(req.user.id, sesionId);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Reserva creada', data: reserva });
    } catch (error) { return next(error); }
  }
  
  async getMisReservas(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await reservaService.getMisReservas(req.user.id, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async cancelarReserva(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.cancelarReserva(id, req.user.id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Reserva cancelada', data: reserva });
    } catch (error) { return next(error); }
  }
  
  // Rutas ADMIN
  async getReservasByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await reservaService.getReservasByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getHistorialReservas(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await reservaService.getHistorialReservasByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async cancelarReservaAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.cancelarReserva(id, null);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Reserva cancelada', data: reserva });
    } catch (error) { return next(error); }
  }
}

module.exports = new ReservaController();