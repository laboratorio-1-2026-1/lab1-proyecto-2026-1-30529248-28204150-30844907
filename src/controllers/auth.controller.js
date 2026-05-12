// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { HTTP_STATUS, CODIGOS_ERROR, MENSAJES } = require('../config/constantes');

class AuthController {
  /**
   * POST /auth/login
   * Login de usuario
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS.LOGIN_EXITOSO,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/register
   * Registrar nuevo usuario (solo ADMIN)
   */
  async register(req, res, next) {
    try {
      const userData = req.body;
      const newUser = await authService.register(userData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MENSAJES.EXITOS.REGISTRO,
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS[HTTP_STATUS.OK],
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /usuarios
   * Listar todos los usuarios (ADMIN)
   */
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await authService.getAllUsers(page, limit);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS[HTTP_STATUS.OK],
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /usuarios/:id
   * Obtener usuario por ID (ADMIN)
   */
  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const user = await authService.getUserById(userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS[HTTP_STATUS.OK],
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /usuarios/:id
   * Actualizar usuario (ADMIN)
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedUser = await authService.updateUser(userId, updateData);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS.ACTUALIZACION,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /usuarios/:id
   * Eliminar usuario (ADMIN)
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const deletedUser = await authService.deleteUser(userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS.ELIMINACION,
        data: deletedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /usuarios/:id/roles
   * Asignar rol a usuario (ADMIN)
   */
  async assignRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { rolId } = req.body;
      
      if (!rolId) {
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          code: CODIGOS_ERROR.CAMPO_REQUERIDO,
          message: 'El campo rolId es requerido'
        };
      }
      
      const updatedUser = await authService.assignRole(userId, parseInt(rolId));
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Rol asignado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /roles
   * Listar todos los roles (ADMIN)
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await authService.getAllRoles();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MENSAJES.EXITOS[HTTP_STATUS.OK],
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();