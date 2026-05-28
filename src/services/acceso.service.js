const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class AccesoService {
  
  // Registrar entrada por cédula
  async registrarEntrada(cedula) {
    if (!cedula) {
      throw { status: 400, message: 'La cédula es requerida' };
    }
    
    // 1. Buscar al cliente por su cédula
    const cliente = await prisma.cliente.findUnique({
      where: { cedula: cedula },
      include: {
        usuario: true,
        membresias: {
          where: { estado: 'ACTIVA' },
          include: { suscripcion: true },
          orderBy: { fechaFin: 'desc' }
        }
      }
    });
    
    if (!cliente) {
      // Registrar intento fallido
      await this.registrarIntentoAcceso(null, cedula, false, 'Cliente no encontrado');
      throw { status: 404, message: 'Cliente no encontrado' };
    }
    
    // 2. Verificar que el usuario esté activo
    if (cliente.usuario.estado !== 'ACTIVO') {
      await this.registrarIntentoAcceso(cliente.id, cedula, false, 'Usuario inactivo');
      throw { status: 409, code: 'USUARIO_INACTIVO', message: 'El usuario está inactivo' };
    }
    
    // 3. Verificar membresía activa
    const hoy = new Date();
    const membresiaActiva = cliente.membresias.find(m => new Date(m.fechaFin) >= hoy);
    
    if (!membresiaActiva) {
      await this.registrarIntentoAcceso(cliente.id, cedula, false, 'Sin membresía activa');
      throw { status: 409, code: 'SIN_MEMBRESIA', message: 'No tiene una membresía activa' };
    }
    
    // 4. Verificar que la membresía no esté vencida
    const fechaFin = new Date(membresiaActiva.fechaFin);
    if (fechaFin < hoy) {
      // Actualizar estado de membresía a VENCIDA
      await prisma.membresia.update({
        where: { id: membresiaActiva.id },
        data: { estado: 'VENCIDA' }
      });
      await this.registrarIntentoAcceso(cliente.id, cedula, false, 'Membresía vencida');
      throw { status: 409, code: 'MEMBRESIA_VENCIDA', message: 'La membresía está vencida' };
    }
    
    // 5. Registrar entrada exitosa
    const acceso = await this.registrarIntentoAcceso(cliente.id, cedula, true, null);
    
    // 6. Calcular días restantes
    const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    
    return {
      acceso,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        cedula: cliente.cedula
      },
      membresia: {
        plan: membresiaActiva.suscripcion.nombre,
        fechaInicio: membresiaActiva.fechaInicio,
        fechaFin: membresiaActiva.fechaFin,
        diasRestantes,
        estado: diasRestantes <= 7 ? 'POR_VENCER' : 'ACTIVA'
      }
    };
  }
  
  // Registrar intento de acceso en bitácora
  async registrarIntentoAcceso(clienteId, cedula, accesoPermitido, motivoRechazo) {
    return await prisma.controlAcceso.create({
      data: {
        idCliente: clienteId,
        fechaHoraEntrada: new Date(),
        estadoAcceso: accesoPermitido ? 'PERMITIDO' : 'DENEGADO',
        motivoRechazo: motivoRechazo || null
      }
    });
  }
  
  // Obtener bitácora de accesos (con filtros)
  async getBitacoraAccesos(filtros = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filtros.clienteId) where.idCliente = parseInt(filtros.clienteId);
    if (filtros.estadoAcceso) where.estadoAcceso = filtros.estadoAcceso;
    if (filtros.fechaInicio && filtros.fechaFin) {
      where.fechaHoraEntrada = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin)
      };
    }
    
    const [accesos, total] = await Promise.all([
      prisma.controlAcceso.findMany({
        skip,
        take: limit,
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              cedula: true
            }
          }
        },
        orderBy: { fechaHoraEntrada: 'desc' }
      }),
      prisma.controlAcceso.count({ where })
    ]);
    
    return {
      data: accesos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  // Obtener accesos de un cliente específico
  async getAccesosByCliente(clienteId, page = 1, limit = 20) {
    return await this.getBitacoraAccesos({ clienteId }, page, limit);
  }
  
  // Verificar si un cliente puede acceder (sin registrar)
  async verificarAcceso(cedula) {
    const cliente = await prisma.cliente.findUnique({
      where: { cedula: cedula },
      include: {
        usuario: true,
        membresias: {
          where: { estado: 'ACTIVA' },
          include: { suscripcion: true },
          orderBy: { fechaFin: 'desc' }
        }
      }
    });
    
    if (!cliente) {
      return { accesoPermitido: false, motivo: 'Cliente no encontrado' };
    }
    
    if (cliente.usuario.estado !== 'ACTIVO') {
      return { accesoPermitido: false, motivo: 'Usuario inactivo' };
    }
    
    const hoy = new Date();
    const membresiaActiva = cliente.membresias.find(m => new Date(m.fechaFin) >= hoy);
    
    if (!membresiaActiva) {
      return { accesoPermitido: false, motivo: 'Sin membresía activa' };
    }
    
    const fechaFin = new Date(membresiaActiva.fechaFin);
    if (fechaFin < hoy) {
      return { accesoPermitido: false, motivo: 'Membresía vencida' };
    }
    
    const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    
    return {
      accesoPermitido: true,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido
      },
      membresia: {
        plan: membresiaActiva.suscripcion.nombre,
        fechaFin: membresiaActiva.fechaFin,
        diasRestantes,
        estado: diasRestantes <= 7 ? 'POR_VENCER' : 'ACTIVA'
      }
    };
  }
}

module.exports = new AccesoService();