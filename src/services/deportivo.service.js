const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class DeportivoService {
  // ==================== DISCIPLINAS (CRUD) ====================
  
  async getAllDisciplinas(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [disciplinas, total] = await Promise.all([
      prisma.disciplina.findMany({ skip, take: limit, orderBy: { id: 'asc' } }),
      prisma.disciplina.count()
    ]);
    return { data: disciplinas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getDisciplinaById(id) {
    const disciplina = await prisma.disciplina.findUnique({ where: { id: parseInt(id) }, include: { sesiones: true } });
    if (!disciplina) throw { status: 404, code: CODIGOS_ERROR.NO_ENCONTRADO, message: 'Disciplina no encontrada' };
    return disciplina;
  }
  
  async createDisciplina(data) {
    const { nombre, descripcion } = data;
    if (!nombre) throw { status: 400, message: 'El nombre es requerido' };
    return await prisma.disciplina.create({ data: { nombre, descripcion: descripcion || null } });
  }
  
  async updateDisciplina(id, data) {
    const existing = await prisma.disciplina.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw { status: 404, message: 'Disciplina no encontrada' };
    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    return await prisma.disciplina.update({ where: { id: parseInt(id) }, data: updateData });
  }
  
  async deleteDisciplina(id) {
    const disciplina = await prisma.disciplina.findUnique({ where: { id: parseInt(id) }, include: { sesiones: true } });
    if (!disciplina) throw { status: 404, message: 'Disciplina no encontrada' };
    if (disciplina.sesiones.length > 0) {
      throw { status: 409, message: `No se puede eliminar porque tiene ${disciplina.sesiones.length} sesión(es) asociada(s)` };
    }
    await prisma.disciplina.delete({ where: { id: parseInt(id) } });
    return { message: 'Disciplina eliminada exitosamente' };
  }
  
  // ==================== ENTRENADORES (CRUD) ====================
  
  async getAllEntrenadores(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [entrenadores, total] = await Promise.all([
      prisma.entrenador.findMany({
        skip, take: limit,
        include: { usuario: { select: { id: true, email: true, nombre: true, apellido: true, estado: true } } },
        orderBy: { id: 'asc' }
      }),
      prisma.entrenador.count()
    ]);
    return { data: entrenadores, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getEntrenadorById(id) {
    const entrenador = await prisma.entrenador.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: { select: { id: true, email: true, nombre: true, apellido: true, estado: true } }, sesiones: { include: { disciplina: true } } }
    });
    if (!entrenador) throw { status: 404, message: 'Entrenador no encontrado' };
    return entrenador;
  }
  
  async createEntrenador(data) {
    const { idUsuario, especialidad } = data;
    if (!idUsuario) throw { status: 400, message: 'El ID de usuario es requerido' };
    
    const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(idUsuario) } });
    if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };
    
    const rol = await prisma.rol.findUnique({ where: { id: usuario.idRol } });
    if (rol.nombre !== 'ENTRENADOR') throw { status: 400, message: `El usuario no tiene rol ENTRENADOR. Rol actual: ${rol.nombre}` };
    
    const existing = await prisma.entrenador.findUnique({ where: { idUsuario: parseInt(idUsuario) } });
    if (existing) throw { status: 409, message: 'Este usuario ya está registrado como entrenador' };
    
    return await prisma.entrenador.create({ data: { idUsuario: parseInt(idUsuario), especialidad: especialidad || null }, include: { usuario: true } });
  }
  
  async updateEntrenador(id, data) {
    const existing = await prisma.entrenador.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw { status: 404, message: 'Entrenador no encontrado' };
    return await prisma.entrenador.update({ where: { id: parseInt(id) }, data: { especialidad: data.especialidad }, include: { usuario: true } });
  }
  
  async deleteEntrenador(id) {
    const entrenador = await prisma.entrenador.findUnique({ where: { id: parseInt(id) }, include: { sesiones: true } });
    if (!entrenador) throw { status: 404, message: 'Entrenador no encontrado' };
    if (entrenador.sesiones.length > 0) {
      throw { status: 409, message: `No se puede eliminar porque tiene ${entrenador.sesiones.length} sesión(es) asignada(s)` };
    }
    await prisma.entrenador.delete({ where: { id: parseInt(id) } });
    return { message: 'Entrenador eliminado exitosamente' };
  }
  
  // ==================== SESIONES (CRUD) ====================
  
  async getAllSesiones(filtros = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};
    if (filtros.disciplinaId) where.idDisciplina = parseInt(filtros.disciplinaId);
    if (filtros.entrenadorId) where.idEntrenador = parseInt(filtros.entrenadorId);
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fecha) {
      const fecha = new Date(filtros.fecha);
      where.fecha = { gte: new Date(fecha.setHours(0, 0, 0)), lt: new Date(fecha.setHours(23, 59, 59)) };
    }
    
    const [sesiones, total] = await Promise.all([
      prisma.sesion.findMany({
        skip, take: limit, where,
        include: { disciplina: true, entrenador: { include: { usuario: { select: { id: true, nombre: true, apellido: true, email: true } } } } },
        orderBy: { fecha: 'asc', horaInicio: 'asc' }
      }),
      prisma.sesion.count({ where })
    ]);
    return { data: sesiones, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getSesionById(id) {
    const sesion = await prisma.sesion.findUnique({
      where: { id: parseInt(id) },
      include: { disciplina: true, entrenador: { include: { usuario: { select: { id: true, nombre: true, apellido: true, email: true } } } } }
    });
    if (!sesion) throw { status: 404, message: 'Sesión no encontrada' };
    return sesion;
  }
  
  async createSesion(data) {
    const { idDisciplina, idEntrenador, fecha, horaInicio, horaFin, limiteDeCupos } = data;
    if (!idDisciplina) throw { status: 400, message: 'La disciplina es requerida' };
    if (!idEntrenador) throw { status: 400, message: 'El entrenador es requerido' };
    if (!fecha) throw { status: 400, message: 'La fecha es requerida' };
    if (!horaInicio) throw { status: 400, message: 'La hora de inicio es requerida' };
    if (!horaFin) throw { status: 400, message: 'La hora de fin es requerida' };
    
    const disciplina = await prisma.disciplina.findUnique({ where: { id: parseInt(idDisciplina) } });
    if (!disciplina) throw { status: 404, message: 'Disciplina no encontrada' };
    
    const entrenador = await prisma.entrenador.findUnique({ where: { id: parseInt(idEntrenador) } });
    if (!entrenador) throw { status: 404, message: 'Entrenador no encontrado' };
    
    const fechaObj = new Date(fecha);
    const inicio = new Date(`${fecha}T${horaInicio}`);
    const fin = new Date(`${fecha}T${horaFin}`);
    if (inicio >= fin) throw { status: 400, message: 'La hora de inicio debe ser menor que la hora de fin' };
    
    const solapamiento = await prisma.sesion.findFirst({
      where: {
        idEntrenador: parseInt(idEntrenador), fecha: fechaObj, estado: { not: 'CANCELADA' },
        OR: [
          { horaInicio: { lt: fin, gte: inicio } },
          { horaFin: { gt: inicio, lte: fin } },
          { horaInicio: { lte: inicio }, horaFin: { gte: fin } }
        ]
      }
    });
    if (solapamiento) throw { status: 409, code: 'SOLAPAMIENTO_HORARIO', message: 'El entrenador ya tiene una clase en ese horario' };
    
    return await prisma.sesion.create({
      data: {
        idDisciplina: parseInt(idDisciplina), idEntrenador: parseInt(idEntrenador),
        fecha: fechaObj, horaInicio: inicio, horaFin: fin,
        limiteDeCupos: limiteDeCupos || 20, estado: 'PROGRAMADA'
      },
      include: { disciplina: true, entrenador: true }
    });
  }
  
  async updateSesion(id, data) {
    const existing = await prisma.sesion.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw { status: 404, message: 'Sesión no encontrada' };
    
    const updateData = {};
    if (data.idDisciplina !== undefined) {
      const disciplina = await prisma.disciplina.findUnique({ where: { id: parseInt(data.idDisciplina) } });
      if (!disciplina) throw { status: 404, message: 'Disciplina no encontrada' };
      updateData.idDisciplina = parseInt(data.idDisciplina);
    }
    if (data.idEntrenador !== undefined) {
      const entrenador = await prisma.entrenador.findUnique({ where: { id: parseInt(data.idEntrenador) } });
      if (!entrenador) throw { status: 404, message: 'Entrenador no encontrado' };
      updateData.idEntrenador = parseInt(data.idEntrenador);
    }
    if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha);
    if (data.horaInicio !== undefined) {
      const fechaStr = data.fecha ? data.fecha : existing.fecha.toISOString().split('T')[0];
      updateData.horaInicio = new Date(`${fechaStr}T${data.horaInicio}`);
    }
    if (data.horaFin !== undefined) {
      const fechaStr = data.fecha ? data.fecha : existing.fecha.toISOString().split('T')[0];
      updateData.horaFin = new Date(`${fechaStr}T${data.horaFin}`);
    }
    if (data.limiteDeCupos !== undefined) updateData.limiteDeCupos = parseInt(data.limiteDeCupos);
    if (data.estado !== undefined) updateData.estado = data.estado;
    
    return await prisma.sesion.update({ where: { id: parseInt(id) }, data: updateData, include: { disciplina: true, entrenador: true } });
  }
  
  async cambiarEstadoSesion(id, estado) {
    const estadosValidos = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
    if (!estadosValidos.includes(estado)) throw { status: 400, message: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` };
    return await prisma.sesion.update({ where: { id: parseInt(id) }, data: { estado }, include: { disciplina: true, entrenador: true } });
  }
  
  async deleteSesion(id) {
    const sesion = await prisma.sesion.findUnique({ where: { id: parseInt(id) }, include: { reservas: true } });
    if (!sesion) throw { status: 404, message: 'Sesión no encontrada' };
    if (sesion.reservas.length > 0) {
      throw { status: 409, message: `No se puede eliminar porque tiene ${sesion.reservas.length} reserva(s) asociada(s)` };
    }
    await prisma.sesion.delete({ where: { id: parseInt(id) } });
    return { message: 'Sesión eliminada exitosamente' };
  }
}

module.exports = new DeportivoService();