// src/services/maquina.service.js
const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class MaquinaService {
  // ==================== MÁQUINAS ====================
  
  async getAllMaquinas(filtros = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.categoriaId) where.idCategoria = parseInt(filtros.categoriaId);
    if (filtros.nombre) where.nombre = { contains: filtros.nombre, mode: 'insensitive' };
    
    const [maquinas, total] = await Promise.all([
      prisma.maquina.findMany({
        skip,
        take: limit,
        where,
        include: { categoria: true },
        orderBy: { id: 'asc' }
      }),
      prisma.maquina.count({ where })
    ]);
    
    return {
      data: maquinas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getMaquinaById(id) {
    const maquina = await prisma.maquina.findUnique({
      where: { id: parseInt(id) },
      include: { 
        categoria: true,
        tickets: true
      }
    });
    
    if (!maquina) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Máquina no encontrada'
      };
    }
    
    return maquina;
  }
  
  async getMaquinaByCodigo(codigo) {
    const maquina = await prisma.maquina.findUnique({
      where: { codigo: parseInt(codigo) },
      include: { categoria: true }
    });
    
    if (!maquina) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Máquina no encontrada'
      };
    }
    
    return maquina;
  }
  
  async createMaquina(data) {
    const { codigo, nombre, idCategoria, descripcion, estado } = data;
    
    // Validar campos requeridos
    if (!codigo) throw { status: 400, message: 'El código es requerido' };
    if (!nombre) throw { status: 400, message: 'El nombre es requerido' };
    if (!idCategoria) throw { status: 400, message: 'La categoría es requerida' };
    
    // Verificar código único
    const existingCodigo = await prisma.maquina.findUnique({
      where: { codigo: parseInt(codigo) }
    });
    
    if (existingCodigo) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `Ya existe una máquina con el código ${codigo}`
      };
    }
    
    // Verificar categoría existe
    const categoria = await prisma.categoriaDeMaquina.findUnique({
      where: { id: parseInt(idCategoria) }
    });
    
    if (!categoria) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Categoría no encontrada'
      };
    }
    
    const nuevaMaquina = await prisma.maquina.create({
      data: {
        codigo: parseInt(codigo),
        nombre,
        idCategoria: parseInt(idCategoria),
        descripcion: descripcion || null,
        estado: estado || 'ACTIVA'
      },
      include: { categoria: true }
    });
    
    return nuevaMaquina;
  }
  
  async updateMaquina(id, data) {
    const { codigo, nombre, idCategoria, descripcion, estado } = data;
    
    const existingMaquina = await prisma.maquina.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingMaquina) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Máquina no encontrada'
      };
    }
    
    // Si cambia código, verificar único
    if (codigo && codigo !== existingMaquina.codigo) {
      const codigoExists = await prisma.maquina.findUnique({
        where: { codigo: parseInt(codigo) }
      });
      if (codigoExists) {
        throw {
          status: 409,
          code: CODIGOS_ERROR.DUPLICADO,
          message: `Ya existe una máquina con el código ${codigo}`
        };
      }
    }
    
    // Si cambia categoría, verificar existe
    if (idCategoria && idCategoria !== existingMaquina.idCategoria) {
      const categoria = await prisma.categoriaDeMaquina.findUnique({
        where: { id: parseInt(idCategoria) }
      });
      if (!categoria) {
        throw {
          status: 404,
          code: CODIGOS_ERROR.NO_ENCONTRADO,
          message: 'Categoría no encontrada'
        };
      }
    }
    
    const updateData = {};
    if (codigo !== undefined) updateData.codigo = parseInt(codigo);
    if (nombre !== undefined) updateData.nombre = nombre;
    if (idCategoria !== undefined) updateData.idCategoria = parseInt(idCategoria);
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;
    
    const maquinaActualizada = await prisma.maquina.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { categoria: true }
    });
    
    return maquinaActualizada;
  }
  
  async cambiarEstado(id, estado) {
    const estadosValidos = ['ACTIVA', 'MANTENIMIENTO', 'FUERA_SERVICIO'];
    
    if (!estadosValidos.includes(estado)) {
      throw {
        status: 400,
        message: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`
      };
    }
    
    const maquina = await prisma.maquina.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!maquina) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Máquina no encontrada'
      };
    }
    
    const maquinaActualizada = await prisma.maquina.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: { categoria: true }
    });
    
    return maquinaActualizada;
  }
  
  async deleteMaquina(id) {
    const maquina = await prisma.maquina.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!maquina) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Máquina no encontrada'
      };
    }
    
    // Soft delete: cambiar estado a FUERA_SERVICIO
    const maquinaEliminada = await prisma.maquina.update({
      where: { id: parseInt(id) },
      data: { estado: 'FUERA_SERVICIO' },
      include: { categoria: true }
    });
    
    return maquinaEliminada;
  }
  
  // ==================== CATEGORÍAS ====================
  
  async getAllCategorias() {
    return await prisma.categoriaDeMaquina.findMany({
      orderBy: { id: 'asc' }
    });
  }
  
  async getCategoriaById(id) {
    const categoria = await prisma.categoriaDeMaquina.findUnique({
      where: { id: parseInt(id) },
      include: { maquinas: true }
    });
    
    if (!categoria) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Categoría no encontrada'
      };
    }
    
    return categoria;
  }
  
  async createCategoria(data) {
    const { nombre, descripcion } = data;
    
    if (!nombre) {
      throw { status: 400, message: 'El nombre de la categoría es requerido' };
    }
    
    const existing = await prisma.categoriaDeMaquina.findFirst({
      where: { nombre }
    });
    
    if (existing) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `La categoría "${nombre}" ya existe`
      };
    }
    
    return await prisma.categoriaDeMaquina.create({
      data: {
        nombre,
        descripcion: descripcion || null
      }
    });
  }
  
  async updateCategoria(id, data) {
    const { nombre, descripcion } = data;
    
    const existing = await prisma.categoriaDeMaquina.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Categoría no encontrada'
      };
    }
    
    if (nombre && nombre !== existing.nombre) {
      const duplicate = await prisma.categoriaDeMaquina.findFirst({
        where: { nombre }
      });
      if (duplicate) {
        throw {
          status: 409,
          code: CODIGOS_ERROR.DUPLICADO,
          message: `La categoría "${nombre}" ya existe`
        };
      }
    }
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    
    return await prisma.categoriaDeMaquina.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }
  
  async deleteCategoria(id) {
    const categoria = await prisma.categoriaDeMaquina.findUnique({
      where: { id: parseInt(id) },
      include: { maquinas: true }
    });
    
    if (!categoria) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Categoría no encontrada'
      };
    }
    
    if (categoria.maquinas.length > 0) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${categoria.maquinas.length} máquina(s) asociada(s)`
      };
    }
    
    await prisma.categoriaDeMaquina.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Categoría eliminada exitosamente' };
  }
}

module.exports = new MaquinaService();