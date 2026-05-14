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
      const result = await authService.getAllUsers(page, limit);
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
      const updatedUser = await authService.updateUser(req.params.id, req.body);
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
      const deletedUser = await authService.deleteUser(req.params.id);
      res.status(HTTP_STATUS.OK).json({ 
        success: true, 
        message: 'Usuario eliminado exitosamente', 
        data: deletedUser 
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getProfile(req, res, next) {
    try {
      if (!req.user) {
        console.log(`🔍 Buscando perfil para usuario ID: ${req.user.id}`);
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      user = await authService.getUserById(req.user.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: user,
          rol: user.rolNombre,
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();