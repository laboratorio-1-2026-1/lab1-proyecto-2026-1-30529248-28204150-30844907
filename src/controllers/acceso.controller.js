const accesoService = require('../services/acceso.service');
const { HTTP_STATUS } = require('../config/constantes');

class AccesoController {
  
  // Registrar entrada por cédula (para recepción/torniquete)
  async registrarEntrada(req, res, next) {
    try {
      const { cedula } = req.body;
      const resultado = await accesoService.registrarEntrada(cedula);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Acceso registrado exitosamente',
        data: resultado
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // Verificar acceso (sin registrar)
  async verificarAcceso(req, res, next) {
    try {
      const { cedula } = req.params;
      const resultado = await accesoService.verificarAcceso(cedula);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // Obtener bitácora de accesos (ADMIN)
  async getBitacoraAccesos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filtros = {
        clienteId: req.query.clienteId,
        estadoAcceso: req.query.estadoAcceso,
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      };
      const result = await accesoService.getBitacoraAccesos(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  // Obtener accesos de un cliente específico
  async getAccesosByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await accesoService.getAccesosByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new AccesoController();