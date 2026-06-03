const suscripcionService = require('../services/suscripcion.service');
const { HTTP_STATUS } = require('../config/constantes');

class SuscripcionController {
  // ==================== PLANES DE SUSCRIPCIÓN ====================
  
  async getAllSuscripciones(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const result = await suscripcionService.getAllSuscripciones(page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async getSuscripcionById(req, res, next) {
    try {
      const { id } = req.params;
      const suscripcion = await suscripcionService.getSuscripcionById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: suscripcion });
    } catch (error) {
      return next(error);
    }
  }
  
  async createSuscripcion(req, res, next) {
    try {
      const nuevaSuscripcion = await suscripcionService.createSuscripcion(req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Plan de suscripción creado exitosamente',
        data: nuevaSuscripcion
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async updateSuscripcion(req, res, next) {
    try {
      const { id } = req.params;
      const suscripcionActualizada = await suscripcionService.updateSuscripcion(id, req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Plan de suscripción actualizado exitosamente',
        data: suscripcionActualizada
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async deleteSuscripcion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await suscripcionService.deleteSuscripcion(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // ==================== MEMBRESÍAS ====================
  
  async getMembresiasByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await suscripcionService.getMembresiasByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async getMembresiaActivaByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const membresia = await suscripcionService.getMembresiaActivaByCliente(clienteId);
      if (!membresia) {
        throw { status: 404, message: 'El cliente no tiene una membresía activa' };
      }
      return res.status(HTTP_STATUS.OK).json({ success: true, data: membresia });
    } catch (error) {
      return next(error);
    }
  }
  
  async getMembresiaById(req, res, next) {
    try {
      const { id } = req.params;
      const membresia = await suscripcionService.getMembresiaById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: membresia });
    } catch (error) {
      return next(error);
    }
  }
  
  async crearMembresia(req, res, next) {
    try {
      const { clienteId, suscripcionId, fechaInicio } = req.body;
      const nuevaMembresia = await suscripcionService.crearMembresia(clienteId, suscripcionId, fechaInicio);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Membresía creada exitosamente',
        data: nuevaMembresia
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async renovarMembresia(req, res, next) {
    try {
      const { id } = req.params;
      const { suscripcionId } = req.body;
      const nuevaMembresia = await suscripcionService.renovarMembresia(id, suscripcionId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Membresía renovada exitosamente',
        data: nuevaMembresia
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // ==================== PAGOS ====================
  
  async registrarPago(req, res, next) {
    try {
      const pago = await suscripcionService.registrarPago({
        ...req.body,
        usuarioId: req.user.id
      });
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: pago
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async getPagosByMembresia(req, res, next) {
    try {
      const { membresiaId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await suscripcionService.getPagosByMembresia(membresiaId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async getPagosByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await suscripcionService.getPagosByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async verificarMembresiaActiva(req, res, next) {
    try {
      const { clienteId } = req.params;
      const resultado = await suscripcionService.verificarMembresiaActiva(clienteId);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: resultado });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new SuscripcionController();