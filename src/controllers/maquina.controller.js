const maquinaService = require('../services/maquina.service');
const { HTTP_STATUS } = require('../config/constantes');

class MaquinaController {
  // ==================== MÁQUINAS ====================
  
  async getAllMaquinas(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filtros = {
        estado: req.query.estado,
        categoriaId: req.query.categoriaId,
        nombre: req.query.nombre
      };
      
      const result = await maquinaService.getAllMaquinas(filtros, page, limit);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
  
  async getMaquinaById(req, res, next) {
    try {
      const { id } = req.params;
      const maquina = await maquinaService.getMaquinaById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: maquina });
    } catch (error) {
      return next(error);
    }
  }
  
  async getMaquinaByCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      const maquina = await maquinaService.getMaquinaByCodigo(codigo);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: maquina });
    } catch (error) {
      return next(error);
    }
  }
  
  async createMaquina(req, res, next) {
    try {
      const nuevaMaquina = await maquinaService.createMaquina(req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Máquina creada exitosamente',
        data: nuevaMaquina
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async updateMaquina(req, res, next) {
    try {
      const { id } = req.params;
      const maquinaActualizada = await maquinaService.updateMaquina(id, req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Máquina actualizada exitosamente',
        data: maquinaActualizada
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const maquina = await maquinaService.cambiarEstado(id, estado);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Estado cambiado a ${estado}`,
        data: maquina
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async deleteMaquina(req, res, next) {
    try {
      const { id } = req.params;
      const maquina = await maquinaService.deleteMaquina(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Máquina eliminada exitosamente',
        data: maquina
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // ==================== CATEGORÍAS ====================
  
  async getAllCategorias(req, res, next) {
    try {
      const categorias = await maquinaService.getAllCategorias();
      return res.status(HTTP_STATUS.OK).json({ success: true, data: categorias });
    } catch (error) {
      return next(error);
    }
  }
  
  async getCategoriaById(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await maquinaService.getCategoriaById(id);
      return res.status(HTTP_STATUS.OK).json({ success: true, data: categoria });
    } catch (error) {
      return next(error);
    }
  }
  
  async createCategoria(req, res, next) {
    try {
      const nuevaCategoria = await maquinaService.createCategoria(req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: nuevaCategoria
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async updateCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const categoriaActualizada = await maquinaService.updateCategoria(id, req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoriaActualizada
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async deleteCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const result = await maquinaService.deleteCategoria(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new MaquinaController();