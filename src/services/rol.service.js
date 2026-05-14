const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class RolService {
  
  async getAllRoles(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [roles, total] = await Promise.all([
      prisma.rol.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' }
      }),
      prisma.rol.count()
    ]);

    return {
      data: roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }


  async getRolById(id) {
    const rol = await prisma.rol.findUnique({
      where: { id: parseInt(id) }
    });

    if (!rol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Rol no encontrado'
      };
    }

    return rol;
  }

  
  async getRolByNombre(nombre) {
    const rol = await prisma.rol.findFirst({
      where: { nombre: nombre.toUpperCase() }
    });

    if (!rol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: `Rol "${nombre}" no encontrado`
      };
    }

    return rol;
  }

  
  async createRol(data) {
    const { nombre, descripcion } = data;

    // Verificar si ya existe
    const existingRol = await prisma.rol.findFirst({
      where: { nombre: nombre.toUpperCase() }
    });

    if (existingRol) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `El rol "${nombre}" ya existe`
      };
    }

    const nuevoRol = await prisma.rol.create({
      data: {
        nombre: nombre.toUpperCase(),
        descripcion: descripcion || null
      }
    });

    return nuevoRol;
  }

  
  async updateRol(id, data) {
    const { nombre, descripcion } = data;

    
    const existingRol = await prisma.rol.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Rol no encontrado'
      };
    }

    // Si cambia el nombre, verificar que no haya duplicado
    if (nombre && nombre.toUpperCase() !== existingRol.nombre) {
      const duplicateRol = await prisma.rol.findFirst({
        where: { nombre: nombre.toUpperCase() }
      });
      if (duplicateRol) {
        throw {
          status: 409,
          code: CODIGOS_ERROR.DUPLICADO,
          message: `El rol "${nombre}" ya existe`
        };
      }
    }

    const rolActualizado = await prisma.rol.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre ? nombre.toUpperCase() : undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined
      }
    });

    return rolActualizado;
  }

  
  async deleteRol(id) {
    const rol = await prisma.rol.findUnique({
      where: { id: parseInt(id) },
      include: { usuarios: true }
    });

    if (!rol) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Rol no encontrado'
      };
    }

    if (rol.usuarios.length > 0) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `No se puede eliminar el rol "${rol.nombre}" porque tiene ${rol.usuarios.length} usuario(s) asociado(s)`
      };
    }

    await prisma.rol.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Rol eliminado exitosamente' };
  }
}

module.exports = new RolService();