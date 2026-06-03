const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class ReservaService {
  // Formatea una sesión para respuesta: fecha -> YYYY-MM-DD, horas -> HH:MM
  formatSesion(sesion) {
    if (!sesion) return sesion;
    const formatted = { ...sesion };
    try {
      if (formatted.fecha) formatted.fecha = new Date(formatted.fecha).toISOString().split('T')[0];
      if (formatted.horaInicio) formatted.horaInicio = new Date(formatted.horaInicio).toISOString().substr(11, 5);
      if (formatted.horaFin) formatted.horaFin = new Date(formatted.horaFin).toISOString().substr(11, 5);
    } catch (err) {
      // ignore and keep originals
    }
    return formatted;
  }
  
  async getSesionesDisponibles(filtros = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { estado: 'PROGRAMADA' };
    if (filtros.fecha) {
      const fecha = new Date(filtros.fecha);
      where.fecha = { gte: new Date(fecha.setHours(0, 0, 0)), lt: new Date(fecha.setHours(23, 59, 59)) };
    }
    if (filtros.disciplinaId) where.idDisciplina = parseInt(filtros.disciplinaId);
    if (filtros.entrenadorId) where.idEntrenador = parseInt(filtros.entrenadorId);
    
    const [sesiones, total] = await Promise.all([
      prisma.sesion.findMany({
        skip, take: limit, where,
        include: { disciplina: true, entrenador: { include: { usuario: true } }, reservas: { where: { estado: 'ACTIVA' } } },
        orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }]
      }),
      prisma.sesion.count({ where })
    ]);
    
    // Si se proporcionó al menos un filtro y no hay sesiones disponibles, devolver 404
    const anyFiltro = Object.values(filtros).some(v => v !== undefined && v !== null && v !== '');
    if (anyFiltro && total === 0) {
      throw { status: 404, code: CODIGOS_ERROR.NO_ENCONTRADO, message: 'No se encontraron sesiones disponibles con los filtros proporcionados' };
    }
    
    const sesionesConCupos = sesiones.map(sesion => ({
      ...sesion,
      cuposOcupados: sesion.reservas.length,
      cuposDisponibles: sesion.limiteDeCupos - sesion.reservas.length,
      hayCupos: (sesion.limiteDeCupos - sesion.reservas.length) > 0
    }));

    // Formatear fecha/hora en las sesiones resultantes
    const sesionesFormateadas = sesionesConCupos.map(s => this.formatSesion(s));

    return { data: sesionesFormateadas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async crearReserva(usuarioId, sesionId) {
    const cliente = await prisma.cliente.findFirst({ where: { idUsuario: parseInt(usuarioId) } });
    console.log('crearReserva - usuarioId:', usuarioId, ' -> cliente encontrado:', cliente && cliente.id);
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    
    const sesion = await prisma.sesion.findUnique({
      where: { id: parseInt(sesionId) },
      include: { reservas: { where: { estado: 'ACTIVA' } } }
    });
    if (!sesion) throw { status: 404, message: 'Sesión no encontrada' };
    if (sesion.estado !== 'PROGRAMADA') throw { status: 409, code: 'SESION_NO_DISPONIBLE', message: 'Sesión no disponible' };
    
    // Regla 1: Control de sobreventa
    if (sesion.reservas.length >= sesion.limiteDeCupos) {
      throw { status: 409, code: 'SIN_CUPOS', message: 'No hay cupos disponibles para esta sesión' };
    }
    
    // Regla 2: Control de solapamiento de horarios
    const reservaConflictiva = await prisma.reserva.findFirst({
      where: {
        idCliente: cliente.id, estado: 'ACTIVA',
        sesion: {
          fecha: sesion.fecha,
          OR: [
            { horaInicio: { lt: sesion.horaFin, gte: sesion.horaInicio } },
            { horaFin: { gt: sesion.horaInicio, lte: sesion.horaFin } }
          ]
        }
      },
      include: { sesion: { include: { disciplina: true } } }
    });
    
    if (reservaConflictiva) {
      throw { status: 409, code: 'SOLAPAMIENTO', message: `Ya tienes una reserva en ese horario: ${reservaConflictiva.sesion.disciplina.nombre}` };
    }
    
    // Regla 3: Evitar reserva duplicada en misma sesión
    const reservaExistente = await prisma.reserva.findFirst({
      where: { idCliente: cliente.id, idSesion: parseInt(sesionId), estado: 'ACTIVA' }
    });
    if (reservaExistente) throw { status: 409, code: 'RESERVA_DUPLICADA', message: 'Ya tienes una reserva en esta sesión' };
    
    try {
      const created = await prisma.reserva.create({
        data: { idCliente: cliente.id, idSesion: parseInt(sesionId), fecha: new Date(), estado: 'ACTIVA' },
        include: { sesion: { include: { disciplina: true, entrenador: { include: { usuario: true } } } } }
      });
      console.log('crearReserva - reserva creada:', created && created.id);
      // Formatear la sesión incluida antes de retornar
      if (created && created.sesion) created.sesion = this.formatSesion(created.sesion);
      return created;
    } catch (err) {
      console.error('crearReserva - error creando reserva:', err);
      throw err;
    }
  }
  
  async getMisReservas(usuarioId, page = 1, limit = 10) {
    const cliente = await prisma.cliente.findFirst({ where: { idUsuario: parseInt(usuarioId) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    return await this.getReservasByCliente(cliente.id, page, limit);
  }
  
  async getReservasByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Verificar que el cliente exista
    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where: { idCliente: parseInt(clienteId), estado: 'ACTIVA' },
        skip, take: limit,
        include: { sesion: { include: { disciplina: true, entrenador: { include: { usuario: true } } } } },
        orderBy: [{ sesion: { fecha: 'asc' } }, { sesion: { horaInicio: 'asc' } }]
      }),
      prisma.reserva.count({ where: { idCliente: parseInt(clienteId), estado: 'ACTIVA' } })
    ]);
    // Formatear sesiones dentro de las reservas
    const reservasFormateadas = reservas.map(r => ({ ...r, sesion: r.sesion ? this.formatSesion(r.sesion) : r.sesion }));
    return { data: reservasFormateadas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async cancelarReserva(reservaId, usuarioId) {
    const reserva = await prisma.reserva.findUnique({ where: { id: parseInt(reservaId) } });
    if (!reserva) throw { status: 404, message: 'Reserva no encontrada' };
    
    if (usuarioId) {
      const cliente = await prisma.cliente.findFirst({ where: { idUsuario: parseInt(usuarioId) } });
      if (reserva.idCliente !== cliente.id) throw { status: 403, message: 'No puedes cancelar una reserva que no te pertenece' };
    }
    
    if (reserva.estado === 'CANCELADA') throw { status: 409, message: 'La reserva ya está cancelada' };
    
    return await prisma.reserva.update({ where: { id: parseInt(reservaId) }, data: { estado: 'CANCELADA' } });
  }
  
  async getHistorialReservasByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Verificar que el cliente exista
    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where: { idCliente: parseInt(clienteId) },
        skip, take: limit,
        include: { sesion: { include: { disciplina: true, entrenador: { include: { usuario: true } } } } },
        orderBy: [{ sesion: { fecha: 'desc' } }]
      }),
      prisma.reserva.count({ where: { idCliente: parseInt(clienteId) } })
    ]);
    const reservasFormateadas = reservas.map(r => ({ ...r, sesion: r.sesion ? this.formatSesion(r.sesion) : r.sesion }));
    return { data: reservasFormateadas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

module.exports = new ReservaService();