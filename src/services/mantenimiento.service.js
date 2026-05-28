const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class MantenimientoService {
  
  // ==================== TICKETS DE MANTENIMIENTO ====================
  
  async getAllTickets(filtros = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filtros.maquinaId) where.idMaquina = parseInt(filtros.maquinaId);
    if (filtros.estado) where.fechaResolucion = filtros.estado === 'ABIERTO' ? null : { not: null };
    
    const [tickets, total] = await Promise.all([
      prisma.ticketMantenimiento.findMany({
        skip, take: limit, where,
        include: { maquina: true, usuario: { select: { id: true, email: true, nombre: true, apellido: true } } },
        orderBy: { fechaFalla: 'desc' }
      }),
      prisma.ticketMantenimiento.count({ where })
    ]);
    
    return { data: tickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getTicketById(id) {
    const ticket = await prisma.ticketMantenimiento.findUnique({
      where: { id: parseInt(id) },
      include: { maquina: true, usuario: { select: { id: true, email: true, nombre: true, apellido: true } } }
    });
    if (!ticket) throw { status: 404, message: 'Ticket no encontrado' };
    return ticket;
  }
  
  async getTicketsByMaquina(maquinaId, page = 1, limit = 10) {
    return await this.getAllTickets({ maquinaId }, page, limit);
  }
  
  async crearTicket(data, usuarioId) {
    const { idMaquina, descripcionFalla } = data;
    if (!idMaquina) throw { status: 400, message: 'La máquina es requerida' };
    if (!descripcionFalla) throw { status: 400, message: 'La descripción de la falla es requerida' };
    
    const maquina = await prisma.maquina.findUnique({ where: { id: parseInt(idMaquina) } });
    if (!maquina) throw { status: 404, message: 'Máquina no encontrada' };
    
    const nuevoTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticketMantenimiento.create({
        data: {
          idMaquina: parseInt(idMaquina),
          idUsuario: parseInt(usuarioId),
          fechaFalla: new Date(),
          descripcionFalla
        }
      });
      
      // Cambiar estado de la máquina a MANTENIMIENTO
      await tx.maquina.update({
        where: { id: parseInt(idMaquina) },
        data: { estado: 'MANTENIMIENTO' }
      });
      
      return ticket;
    });
    
    return await this.getTicketById(nuevoTicket.id);
  }
  
  async resolverTicket(id, data, usuarioId) {
    const { costoReparacion, descripcionResolucion } = data;
    const ticket = await prisma.ticketMantenimiento.findUnique({ where: { id: parseInt(id) } });
    if (!ticket) throw { status: 404, message: 'Ticket no encontrado' };
    if (ticket.fechaResolucion) throw { status: 409, message: 'El ticket ya está resuelto' };
    
    const ticketResuelto = await prisma.$transaction(async (tx) => {
      const ticketActualizado = await tx.ticketMantenimiento.update({
        where: { id: parseInt(id) },
        data: {
          fechaResolucion: new Date(),
          costoReparacion: costoReparacion ? parseFloat(costoReparacion) : null
        }
      });
      
      // Cambiar estado de la máquina a ACTIVA
      await tx.maquina.update({
        where: { id: ticket.idMaquina },
        data: { estado: 'ACTIVA' }
      });
      
      return ticketActualizado;
    });
    
    return await this.getTicketById(ticketResuelto.id);
  }
  
  async cancelarTicket(id) {
    const ticket = await prisma.ticketMantenimiento.findUnique({ where: { id: parseInt(id) } });
    if (!ticket) throw { status: 404, message: 'Ticket no encontrado' };
    if (ticket.fechaResolucion) throw { status: 409, message: 'No se puede cancelar un ticket ya resuelto' };
    
    const ticketCancelado = await prisma.$transaction(async (tx) => {
      const ticketActualizado = await tx.ticketMantenimiento.update({
        where: { id: parseInt(id) },
        data: { fechaResolucion: new Date(), costoReparacion: 0 }
      });
      
      await tx.maquina.update({
        where: { id: ticket.idMaquina },
        data: { estado: 'ACTIVA' }
      });
      
      return ticketActualizado;
    });
    
    return ticketCancelado;
  }
  
  // ==================== REPORTES ====================
  
  async getReporteMantenimientoPorMaquina(maquinaId) {
    const maquina = await prisma.maquina.findUnique({
      where: { id: parseInt(maquinaId) },
      include: { tickets: { orderBy: { fechaFalla: 'desc' } } }
    });
    if (!maquina) throw { status: 404, message: 'Máquina no encontrada' };
    
    const ticketsAbiertos = maquina.tickets.filter(t => !t.fechaResolucion);
    const ticketsResueltos = maquina.tickets.filter(t => t.fechaResolucion);
    const costos = ticketsResueltos.reduce((sum, t) => sum + (t.costoReparacion || 0), 0);
    
    return {
      maquina: { id: maquina.id, nombre: maquina.nombre, estado: maquina.estado },
      tickets: maquina.tickets,
      estadisticas: {
        totalTickets: maquina.tickets.length,
        ticketsAbiertos: ticketsAbiertos.length,
        ticketsResueltos: ticketsResueltos.length,
        costoTotalMantenimiento: costos
      }
    };
  }
  
  async getReporteMantenimientoGeneral(fechaInicio, fechaFin) {
    const where = {};
    if (fechaInicio && fechaFin) {
      where.fechaFalla = { gte: new Date(fechaInicio), lte: new Date(fechaFin) };
    }
    
    const tickets = await prisma.ticketMantenimiento.findMany({
      where, include: { maquina: true },
      orderBy: { fechaFalla: 'desc' }
    });
    
    const ticketsResueltos = tickets.filter(t => t.fechaResolucion);
    const costoTotal = ticketsResueltos.reduce((sum, t) => sum + (t.costoReparacion || 0), 0);
    
    const maquinasMasMantenimiento = {};
    for (const ticket of tickets) {
      if (!maquinasMasMantenimiento[ticket.maquina.nombre]) {
        maquinasMasMantenimiento[ticket.maquina.nombre] = { maquina: ticket.maquina.nombre, cantidad: 0 };
      }
      maquinasMasMantenimiento[ticket.maquina.nombre].cantidad++;
    }
    
    return {
      resumen: {
        totalTickets: tickets.length,
        ticketsAbiertos: tickets.filter(t => !t.fechaResolucion).length,
        ticketsResueltos: ticketsResueltos.length,
        costoTotalMantenimiento: costoTotal
      },
      maquinasConMasMantenimiento: Object.values(maquinasMasMantenimiento).sort((a, b) => b.cantidad - a.cantidad),
      tickets
    };
  }
}

module.exports = new MantenimientoService();