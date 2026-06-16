const biometricoService = require('../services/biometrico.service');
const { HTTP_STATUS } = require('../config/constantes');

class BiometricoController {
  
  async registrarEvaluacion(req, res, next) {
    try {
      const nuevaEvaluacion = await biometricoService.registrarEvaluacion(req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Evaluación registrada exitosamente',
        data: nuevaEvaluacion
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async getHistorialByCliente(req, res, next) {
    try {
      const { clienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await biometricoService.getHistorialByCliente(clienteId, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async getUltimaEvaluacion(req, res, next) {
    try {
      const { clienteId } = req.params;
      const evaluacion = await biometricoService.getUltimaEvaluacion(clienteId);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: evaluacion });
    } catch (error) {
      return next(error);
    }
  }
  
  async getEvaluacionById(req, res, next) {
    try {
      const { id } = req.params;
      const evaluacion = await biometricoService.getEvaluacionById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: evaluacion });
    } catch (error) {
      return next(error);
    }
  }
  
  async updateEvaluacion(req, res, next) {
    try {
      const { id } = req.params;
      const evaluacionActualizada = await biometricoService.updateEvaluacion(id, req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Evaluación actualizada exitosamente',
        data: evaluacionActualizada
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async deleteEvaluacion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await biometricoService.deleteEvaluacion(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async getResumenProgreso(req, res, next) {
    try {
      const { clienteId } = req.params;
      const resumen = await biometricoService.getResumenProgreso(clienteId);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: resumen });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new BiometricoController();