const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class SuscripcionService {
  // ==================== PLANES DE SUSCRIPCIÓN ====================
  
  async getAllSuscripciones(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [suscripciones, total] = await Promise.all([
      prisma.suscripcion.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' }
      }),
      prisma.suscripcion.count()
    ]);
    
    return {
      data: suscripciones,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  async getSuscripcionById(id) {
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: parseInt(id) },
      include: { membresias: true }
    });
    
    if (!suscripcion) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Plan de suscripción no encontrado'
      };
    }
    
    return suscripcion;
  }
  
  async createSuscripcion(data) {
    const { nombre, descripcion, costo, diasDuracion } = data;
    
    if (!nombre) throw { status: 400, message: 'El nombre es requerido' };
    if (!costo) throw { status: 400, message: 'El costo es requerido' };
    if (!diasDuracion) throw { status: 400, message: 'La duración en días es requerida' };
    
    const nuevaSuscripcion = await prisma.suscripcion.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        costo: parseFloat(costo),
        diasDuracion: parseInt(diasDuracion)
      }
    });
    
    return nuevaSuscripcion;
  }
  
  async updateSuscripcion(id, data) {
    const { nombre, descripcion, costo, diasDuracion } = data;
    
    const existing = await prisma.suscripcion.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Plan de suscripción no encontrado'
      };
    }
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (costo !== undefined) updateData.costo = parseFloat(costo);
    if (diasDuracion !== undefined) updateData.diasDuracion = parseInt(diasDuracion);
    
    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return suscripcionActualizada;
  }
  
  async deleteSuscripcion(id) {
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: parseInt(id) },
      include: { membresias: true }
    });
    
    if (!suscripcion) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Plan de suscripción no encontrado'
      };
    }
    
    if (suscripcion.membresias.length > 0) {
      throw {
        status: 409,
        code: CODIGOS_ERROR.DUPLICADO,
        message: `No se puede eliminar el plan "${suscripcion.nombre}" porque tiene ${suscripcion.membresias.length} membresía(s) asociada(s)`
      };
    }
    
    await prisma.suscripcion.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Plan de suscripción eliminado exitosamente' };
  }
  
  // ==================== MEMBRESÍAS DE CLIENTES ====================
  
  async getMembresiasByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [membresias, total] = await Promise.all([
      prisma.membresia.findMany({
        where: { idCliente: parseInt(clienteId) },
        skip,
        take: limit,
        include: {
          suscripcion: true,
          pagos: true
        },
        orderBy: { fechaFin: 'desc' }
      }),
      prisma.membresia.count({ where: { idCliente: parseInt(clienteId) } })
    ]);
    
    // Calcular estado actual si es necesario
    const membresiasConEstado = membresias.map(m => ({
      ...m,
      estadoActual: this.calcularEstadoMembresia(m.fechaFin)
    }));
    
    return {
      data: membresiasConEstado,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  async getMembresiaActivaByCliente(clienteId) {
    const membresia = await prisma.membresia.findFirst({
      where: {
        idCliente: parseInt(clienteId),
        estado: 'ACTIVA'
      },
      include: {
        suscripcion: true,
        pagos: true
      },
      orderBy: { fechaFin: 'desc' }
    });
    
    return membresia;
  }
  
  async getMembresiaById(id) {
    const membresia = await prisma.membresia.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: {
          include: { usuario: true }
        },
        suscripcion: true,
        pagos: true
      }
    });
    
    if (!membresia) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Membresía no encontrada'
      };
    }
    
    return {
      ...membresia,
      estadoActual: this.calcularEstadoMembresia(membresia.fechaFin)
    };
  }
  
  async crearMembresia(clienteId, suscripcionId, fechaInicio = null) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(clienteId) }
    });
    
    if (!cliente) {
      throw { status: 404, message: 'Cliente no encontrado' };
    }
    
    // Verificar que el plan existe
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: parseInt(suscripcionId) }
    });
    
    if (!suscripcion) {
      throw { status: 404, message: 'Plan de suscripción no encontrado' };
    }
    
    // Calcular fechas
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + suscripcion.diasDuracion);
    
    // Crear membresía
    const nuevaMembresia = await prisma.membresia.create({
      data: {
        idCliente: parseInt(clienteId),
        idSuscripcion: parseInt(suscripcionId),
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'ACTIVA'
      },
      include: {
        suscripcion: true
      }
    });
    
    return nuevaMembresia;
  }
  
  async renovarMembresia(membresiaId, suscripcionId = null) {
    const membresiaActual = await prisma.membresia.findUnique({
      where: { id: parseInt(membresiaId) },
      include: { suscripcion: true }
    });
    
    if (!membresiaActual) {
      throw { status: 404, message: 'Membresía no encontrada' };
    }
    
    const suscripcionIdFinal = suscripcionId || membresiaActual.idSuscripcion;
    
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: parseInt(suscripcionIdFinal) }
    });
    
    if (!suscripcion) {
      throw { status: 404, message: 'Plan de suscripción no encontrado' };
    }
    
    // Calcular nueva fecha de fin (desde la fecha actual o desde la fecha de fin actual)
    const fechaInicio = new Date();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + suscripcion.diasDuracion);
    
    // Crear nueva membresía
    const nuevaMembresia = await prisma.membresia.create({
      data: {
        idCliente: membresiaActual.idCliente,
        idSuscripcion: suscripcion.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: 'ACTIVA'
      },
      include: {
        suscripcion: true
      }
    });
    
    // Actualizar membresía anterior a VENCIDA
    await prisma.membresia.update({
      where: { id: parseInt(membresiaId) },
      data: { estado: 'VENCIDA' }
    });
    
    return nuevaMembresia;
  }
  
  // ==================== PAGOS ====================
  
  async registrarPago(data) {
    const { idMembresia, monto, metodoPago, usuarioId } = data;
    
    if (!idMembresia) throw { status: 400, message: 'ID de membresía es requerido' };
    if (!monto) throw { status: 400, message: 'El monto es requerido' };
    if (!metodoPago) throw { status: 400, message: 'El método de pago es requerido' };
    
    // Verificar que la membresía existe
    const membresia = await prisma.membresia.findUnique({
      where: { id: parseInt(idMembresia) },
      include: { suscripcion: true }
    });
    
    if (!membresia) {
      throw { status: 404, message: 'Membresía no encontrada' };
    }
    
    // Registrar pago
    const nuevoPago = await prisma.pago.create({
      data: {
        idMembresia: parseInt(idMembresia),
        monto: parseFloat(monto),
        fechaPago: new Date(),
        metodoPago: metodoPago
      },
      include: {
        membresia: {
          include: {
            suscripcion: true,
            cliente: {
              include: { usuario: true }
            }
          }
        }
      }
    });
    
    return nuevoPago;
  }
  
  async getPagosByMembresia(membresiaId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: { idMembresia: parseInt(membresiaId) },
        skip,
        take: limit,
        include: {
          membresia: {
            include: {
              suscripcion: true
            }
          }
        },
        orderBy: { fechaPago: 'desc' }
      }),
      prisma.pago.count({ where: { idMembresia: parseInt(membresiaId) } })
    ]);
    
    return {
      data: pagos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  async getPagosByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: {
          membresia: {
            idCliente: parseInt(clienteId)
          }
        },
        skip,
        take: limit,
        include: {
          membresia: {
            include: {
              suscripcion: true,
              cliente: {
                include: { usuario: true }
              }
            }
          }
        },
        orderBy: { fechaPago: 'desc' }
      }),
      prisma.pago.count({
        where: {
          membresia: {
            idCliente: parseInt(clienteId)
          }
        }
      })
    ]);
    
    return {
      data: pagos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  // ==================== UTILIDADES ====================
  
  calcularEstadoMembresia(fechaFin) {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diasRestantes = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'VENCIDA';
    if (diasRestantes <= 7) return 'POR_VENCER';
    return 'ACTIVA';
  }
  
  async verificarMembresiaActiva(clienteId) {
    const membresia = await this.getMembresiaActivaByCliente(clienteId);
    
    if (!membresia) {
      return { activa: false, motivo: 'Sin membresía activa' };
    }
    
    const estado = this.calcularEstadoMembresia(membresia.fechaFin);
    
    if (estado === 'VENCIDA') {
      // Actualizar estado en BD
      await prisma.membresia.update({
        where: { id: membresia.id },
        data: { estado: 'VENCIDA' }
      });
      return { activa: false, motivo: 'Membresía vencida' };
    }
    
    if (estado === 'POR_VENCER' && membresia.estado !== 'POR_VENCER') {
      await prisma.membresia.update({
        where: { id: membresia.id },
        data: { estado: 'POR_VENCER' }
      });
    }
    
    return {
      activa: true,
      membresia: {
        ...membresia,
        estadoActual: estado,
        diasRestantes: Math.ceil((new Date(membresia.fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
      }
    };
  }
}

module.exports = new SuscripcionService();