const rolService = require('../services/rol.service');
const { HTTP_STATUS } = require('../config/constantes');

class RolController {
  // Listar todos los roles
  async getAllRoles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const result = await rolService.getAllRoles(page, limit);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener rol por ID
  async getRolById(req, res, next) {
    try {
      const rol = await rolService.getRolById(req.params.id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: rol
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo rol
  async createRol(req, res, next) {
    try {
      const nuevoRol = await rolService.createRol(req.body);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: nuevoRol
      });
    } catch (error) {
      next(error);
    }
  }
  
// Actualizar rol
  async updateRol(req, res, next) {
    try {
      const rolActualizado = await rolService.updateRol(req.params.id, req.body);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: rolActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar rol
  async deleteRol(req, res, next) {
    try {
      const result = await rolService.deleteRol(req.params.id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RolController();