const authService = require('../services/auth.service');
const authMiddleware = require('../middlewares/auth.middleware');
const { HTTP_STATUS } = require('../config/constantes');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(HTTP_STATUS.CREATED).json({ success: true,
         message: 'Login exitoso', 
         data: { 
          user: result.usuario, 
          token: result.token 
        } 
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const newUser = await authService.register(req.body);
      res.status(HTTP_STATUS.CREATED).json({ 
        success: true, 
        message: 'Usuario registrado exitosamente', 
        data: newUser 
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeInactive = req.query.includeInactive === 'true' || req.query.showInactive === 'true';
      const result = await authService.getAllUsers(page, limit, includeInactive);
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await authService.getUserById(req.params.id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const requesterId = req.user?.id;
      const updatedUser = await authService.updateUser(req.params.id, req.body, requesterId);
      res.status(HTTP_STATUS.OK).json({ 
        success: true, 
        message: 'Usuario actualizado exitosamente', 
        data: updatedUser 
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const requesterId = req.user?.id;
      const deletedUser = await authService.deleteUser(req.params.id, requesterId);
      res.status(HTTP_STATUS.OK).json({ 
        success: true, 
        message: 'Usuario eliminado exitosamente', 
        data: deletedUser 
      });
    } catch (error) {
      next(error);
    }
  }

  async reactivateUser(req, res, next) {
    try {
      const requesterId = req.user?.id;
      const reactivated = await authService.reactivateUser(req.params.id, requesterId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Usuario reactivado exitosamente', data: reactivated });
    } catch (error) {
      next(error);
    }
  }
  
  async getProfile(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'No autenticado' });
      }
      const user = await authService.getProfile(userId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: user,
          rol: user.rol,
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();