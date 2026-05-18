const deportivoService = require('../services/deportivo.service');
const { HTTP_STATUS } = require('../config/constantes');

class DeportivoController {
  async getAllDisciplinas(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const result = await deportivoService.getAllDisciplinas(page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getDisciplinaById(req, res, next) {
    try {
      const { id } = req.params;
      const disciplina = await deportivoService.getDisciplinaById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: disciplina });
    } catch (error) { return next(error); }
  }
  
  async createDisciplina(req, res, next) {
    try {
      const nuevaDisciplina = await deportivoService.createDisciplina(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Disciplina creada', data: nuevaDisciplina });
    } catch (error) { return next(error); }
  }
  
  async updateDisciplina(req, res, next) {
    try {
      const { id } = req.params;
      const disciplina = await deportivoService.updateDisciplina(id, req.body);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Disciplina actualizada', data: disciplina });
    } catch (error) { return next(error); }
  }
  
  async deleteDisciplina(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deportivoService.deleteDisciplina(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
    } catch (error) { return next(error); }
  }
  
  async getAllEntrenadores(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const result = await deportivoService.getAllEntrenadores(page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getEntrenadorById(req, res, next) {
    try {
      const { id } = req.params;
      const entrenador = await deportivoService.getEntrenadorById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: entrenador });
    } catch (error) { return next(error); }
  }
  
  async createEntrenador(req, res, next) {
    try {
      const nuevoEntrenador = await deportivoService.createEntrenador(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Entrenador registrado', data: nuevoEntrenador });
    } catch (error) { return next(error); }
  }
  
  async updateEntrenador(req, res, next) {
    try {
      const { id } = req.params;
      const entrenador = await deportivoService.updateEntrenador(id, req.body);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Entrenador actualizado', data: entrenador });
    } catch (error) { return next(error); }
  }
  
  async deleteEntrenador(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deportivoService.deleteEntrenador(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
    } catch (error) { return next(error); }
  }
  
  async getAllSesiones(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filtros = { disciplinaId: req.query.disciplinaId, entrenadorId: req.query.entrenadorId, estado: req.query.estado, fecha: req.query.fecha };
      const result = await deportivoService.getAllSesiones(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { return next(error); }
  }
  
  async getSesionById(req, res, next) {
    try {
      const { id } = req.params;
      const sesion = await deportivoService.getSesionById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: sesion });
    } catch (error) { return next(error); }
  }
  
  async createSesion(req, res, next) {
    try {
      const nuevaSesion = await deportivoService.createSesion(req.body);
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Sesión creada', data: nuevaSesion });
    } catch (error) { return next(error); }
  }
  
  async updateSesion(req, res, next) {
    try {
      const { id } = req.params;
      const sesion = await deportivoService.updateSesion(id, req.body);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Sesión actualizada', data: sesion });
    } catch (error) { return next(error); }
  }
  
  async cambiarEstadoSesion(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const sesion = await deportivoService.cambiarEstadoSesion(id, estado);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: `Estado cambiado a ${estado}`, data: sesion });
    } catch (error) { return next(error); }
  }
  
  async deleteSesion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deportivoService.deleteSesion(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
    } catch (error) { return next(error); }
  }
}

module.exports = new DeportivoController();