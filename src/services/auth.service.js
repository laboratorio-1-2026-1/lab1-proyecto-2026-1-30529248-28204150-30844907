// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { hashPassword } = require('../utils/hash');
const { CODIGOS_ERROR, ESTADOS_GENERALES, TOKENS } = require('../config/constantes');

class AuthService {
  /**
   * Autenticar usuario y generar token JWT
   */
  async login(email, password) {
    // Buscar usuario por email incluyendo su rol
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true
      }
    });

    if (!usuario) {
      throw {
        status: 401,
        code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS,
        message: 'Credenciales inválidas'
      };
    }

    // Verificar estado del usuario
    if (usuario.estado !== ESTADOS_GENERALES.ACTIVO) {
      throw {
        status: 401,
        code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS,
        message: 'Usuario inactivo'
      };
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      throw {
        status: 401,
        code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS,
        message: 'Credenciales inválidas'
      };
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rolId: usuario.idRol,
        rolNombre: usuario.rol.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKENS.JWT_EXPIRES_IN }
    );

    // Remover password del objeto de respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      token,
      usuario: usuarioSinPassword
    };
  }

  /**
   * Registrar un nuevo usuario (solo ADMIN)
   */
  async register(userData) {
    const { email, password, idRol, descripcion } = userData;

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: 'El email ya está registrado'
      };
    }

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: idRol }
    });

    if (!rol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'El rol especificado no existe'
      };
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        idRol,
        descripcion: descripcion || null,
        estado: ESTADOS_GENERALES.ACTIVO
      },
      include: {
        rol: true
      }
    });

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    return usuarioSinPassword;
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        rol: true
      }
    });

    if (!usuario) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Listar todos los usuarios (solo ADMIN)
   */
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50); // Máximo 50 por página

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take,
        include: {
          rol: true
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.usuario.count()
    ]);

    // Remover passwords
    const usuariosSinPassword = usuarios.map(({ password, ...rest }) => rest);

    return {
      data: usuariosSinPassword,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Obtener usuario por ID (solo ADMIN)
   */
  async getUserById(userId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        rol: true
      }
    });

    if (!usuario) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Actualizar usuario (solo ADMIN)
   */
  async updateUser(userId, updateData) {
    const { email, idRol, descripcion, estado } = updateData;

    // Verificar si el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    // Si se actualiza email, verificar que no exista otro usuario con ese email
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email }
      });
      if (emailExists) {
        throw {
          status: 409,
          code: CODIGOS_ERROR.DUPLICADO,
          message: 'El email ya está registrado'
        };
      }
    }

    // Si se actualiza rol, verificar que existe
    if (idRol) {
      const rol = await prisma.rol.findUnique({
        where: { id: idRol }
      });
      if (!rol) {
        throw {
          status: 404,
          code: CODIGOS_ERROR.NO_ENCONTRADO,
          message: 'El rol especificado no existe'
        };
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        email: email || undefined,
        idRol: idRol || undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined,
        estado: estado || undefined
      },
      include: {
        rol: true
      }
    });

    const { password: _, ...usuarioSinPassword } = usuarioActualizado;
    return usuarioSinPassword;
  }

  /**
   * Eliminar usuario (soft delete sugerido - solo ADMIN)
   */
  async deleteUser(userId) {
    const existingUser = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    // Soft delete: cambiar estado a inactivo
    const usuarioEliminado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        estado: ESTADOS_GENERALES.INACTIVO
      },
      include: {
        rol: true
      }
    });

    const { password: _, ...usuarioSinPassword } = usuarioEliminado;
    return usuarioSinPassword;
  }

  /**
   * Asignar rol a un usuario
   */
  async assignRole(userId, rolId) {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    // Verificar si el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: rolId }
    });

    if (!rol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Rol no encontrado'
      };
    }

    // Actualizar rol
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: { idRol: rolId },
      include: { rol: true }
    });

    const { password: _, ...usuarioSinPassword } = usuarioActualizado;
    return usuarioSinPassword;
  }

  /**
   * Listar todos los roles
   */
  async getAllRoles() {
    const roles = await prisma.rol.findMany({
      orderBy: { id: 'asc' }
    });
    return roles;
  }
}

module.exports = new AuthService();