const mantenimientoService = require('../services/mantenimiento.service');
const { HTTP_STATUS } = require('../config/constantes');

class MantenimientoController {
  
  async getAllTickets(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filtros = { maquinaId: req.query.maquinaId, estado: req.query.estado };
      const result = await mantenimientoService.getAllTickets(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await mantenimientoService.getTicketById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: ticket });
    } catch (error) { return next(error); }
  }
  
  async getTicketsByMaquina(req, res, next) {
    try {
      const { maquinaId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await mantenimientoService.getTicketsByMaquina(maquinaId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async crearTicket(req, res, next) {
    try {
      const nuevoTicket = await mantenimientoService.crearTicket(req.body, req.user.id);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Ticket creado', data: nuevoTicket });
    } catch (error) { return next(error); }
  }
  
  async resolverTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await mantenimientoService.resolverTicket(id, req.body, req.user.id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Ticket resuelto', data: ticket });
    } catch (error) { return next(error); }
  }
  
  async cancelarTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await mantenimientoService.cancelarTicket(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Ticket cancelado', data: ticket });
    } catch (error) { return next(error); }
  }
  
  async getReportePorMaquina(req, res, next) {
    try {
      const { maquinaId } = req.params;
      const reporte = await mantenimientoService.getReporteMantenimientoPorMaquina(maquinaId);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: reporte });
    } catch (error) { return next(error); }
  }
  
  async getReporteGeneral(req, res, next) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const reporte = await mantenimientoService.getReporteMantenimientoGeneral(fechaInicio, fechaFin);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: reporte });
    } catch (error) { return next(error); }
  }
}

module.exports = new MantenimientoController();