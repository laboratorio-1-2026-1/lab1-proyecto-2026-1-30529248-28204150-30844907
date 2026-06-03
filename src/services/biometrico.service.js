const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class BiometricoService {
  // Formatea una evaluación: fechaEvaluacion -> YYYY-MM-DD
  formatEvaluacion(evaluacion) {
    if (!evaluacion) return evaluacion;
    const formatted = { ...evaluacion };
    try {
      if (formatted.fechaEvaluacion) formatted.fechaEvaluacion = new Date(formatted.fechaEvaluacion).toISOString().split('T')[0];
    } catch (err) { }
    return formatted;
  }
  
  // Registrar evaluación biométrica
  async registrarEvaluacion(data) {
    const { idCliente, idEntrenador, peso, estatura, porcentajeGrasa, observaciones } = data;
    
    if (!idCliente) throw { status: 400, message: 'El cliente es requerido' };
    if (!idEntrenador) throw { status: 400, message: 'El entrenador es requerido' };
    if (!peso) throw { status: 400, message: 'El peso es requerido' };
    if (!estatura) throw { status: 400, message: 'La estatura es requerida' };
    
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(idCliente) }
    });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    
    // Verificar que el entrenador existe
    const entrenador = await prisma.entrenador.findUnique({
      where: { id: parseInt(idEntrenador) }
    });
    if (!entrenador) throw { status: 404, message: 'Entrenador no encontrado' };
    
    const nuevaEvaluacion = await prisma.evaluacionBiometrica.create({
      data: {
        idCliente: parseInt(idCliente),
        idEntrenador: parseInt(idEntrenador),
        fechaEvaluacion: new Date(),
        peso: parseFloat(peso),
        estatura: parseFloat(estatura),
        porcentajeGrasa: porcentajeGrasa ? parseFloat(porcentajeGrasa) : null,
        observaciones: observaciones || null
      },
      include: {
        cliente: {
          include: { usuario: true }
        },
        entrenador: {
          include: { usuario: true }
        }
      }
    });
    
    return this.formatEvaluacion(nuevaEvaluacion);
  }
  
  // Obtener historial de evaluaciones de un cliente
  async getHistorialByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };

    const [evaluaciones, total] = await Promise.all([
      prisma.evaluacionBiometrica.findMany({
        where: { idCliente: parseInt(clienteId) },
        skip,
        take: limit,
        include: {
          entrenador: {
            include: { usuario: true }
          }
        },
        orderBy: { fechaEvaluacion: 'desc' }
      }),
      prisma.evaluacionBiometrica.count({
        where: { idCliente: parseInt(clienteId) }
      })
    ]);
    
    // Calcular evolución (diferencias entre evaluaciones)
    const evaluacionesConEvolucion = evaluaciones.map((evalActual, index) => {
      const evalAnterior = evaluaciones[index + 1];
      if (!evalAnterior) return { ...evalActual, evolucion: null };
      
      return {
        ...evalActual,
        evolucion: {
          peso: (evalActual.peso - evalAnterior.peso).toFixed(1),
          porcentajeGrasa: evalActual.porcentajeGrasa && evalAnterior.porcentajeGrasa 
            ? (evalActual.porcentajeGrasa - evalAnterior.porcentajeGrasa).toFixed(1)
            : null,
          diasDiferencia: Math.floor((evalActual.fechaEvaluacion - evalAnterior.fechaEvaluacion) / (1000 * 60 * 60 * 24))
        }
      };
    });
    // Formatear fechaEvaluacion en los resultados
    const evaluacionesFormateadas = evaluacionesConEvolucion.map(ev => this.formatEvaluacion(ev));
    
    return {
      data: evaluacionesFormateadas,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  // Obtener última evaluación de un cliente
  async getUltimaEvaluacion(clienteId) {
    const evaluacion = await prisma.evaluacionBiometrica.findFirst({
      where: { idCliente: parseInt(clienteId) },
      include: {
        entrenador: {
          include: { usuario: true }
        }
      },
      orderBy: { fechaEvaluacion: 'desc' }
    });
    
    if (!evaluacion) {
      throw { status: 404, message: 'No hay evaluaciones para este cliente' };
    }
    
    return this.formatEvaluacion(evaluacion);
  }
  
  // Obtener evaluación por ID
  async getEvaluacionById(id) {
    const evaluacion = await prisma.evaluacionBiometrica.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: {
          include: { usuario: true }
        },
        entrenador: {
          include: { usuario: true }
        }
      }
    });
    
    if (!evaluacion) {
      throw { status: 404, message: 'Evaluación no encontrada' };
    }
    
    return this.formatEvaluacion(evaluacion);
  }
  
  // Actualizar evaluación
  async updateEvaluacion(id, data) {
    const { peso, estatura, porcentajeGrasa, observaciones } = data;
    
    const existing = await prisma.evaluacionBiometrica.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      throw { status: 404, message: 'Evaluación no encontrada' };
    }
    
    const updateData = {};
    if (peso !== undefined) updateData.peso = parseFloat(peso);
    if (estatura !== undefined) updateData.estatura = parseFloat(estatura);
    if (porcentajeGrasa !== undefined) updateData.porcentajeGrasa = parseFloat(porcentajeGrasa);
    if (observaciones !== undefined) updateData.observaciones = observaciones;
    
    const updated = await prisma.evaluacionBiometrica.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        entrenador: { include: { usuario: true } }
      }
    });
    return this.formatEvaluacion(updated);
  }
  
  // Eliminar evaluación
  async deleteEvaluacion(id) {
    const existing = await prisma.evaluacionBiometrica.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      throw { status: 404, message: 'Evaluación no encontrada' };
    }
    
    await prisma.evaluacionBiometrica.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Evaluación eliminada exitosamente' };
  }
  
  // Resumen de progreso del cliente (primera y última evaluación)
  async getResumenProgreso(clienteId) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };

    const [primera, ultima] = await Promise.all([
      prisma.evaluacionBiometrica.findFirst({
        where: { idCliente: parseInt(clienteId) },
        orderBy: { fechaEvaluacion: 'asc' }
      }),
      prisma.evaluacionBiometrica.findFirst({
        where: { idCliente: parseInt(clienteId) },
        orderBy: { fechaEvaluacion: 'desc' }
      })
    ]);

    if (!primera || !ultima) {
      throw { status: 404, message: 'No hay suficientes evaluaciones para calcular progreso' };
    }

    return {
      primeraEvaluacion: this.formatEvaluacion(primera),
      ultimaEvaluacion: this.formatEvaluacion(ultima),
      progreso: {
        peso: (ultima.peso - primera.peso).toFixed(1),
        porcentajeGrasa: ultima.porcentajeGrasa && primera.porcentajeGrasa 
          ? (ultima.porcentajeGrasa - primera.porcentajeGrasa).toFixed(1)
          : null,
        periodoDias: Math.floor((ultima.fechaEvaluacion - primera.fechaEvaluacion) / (1000 * 60 * 60 * 24))
      }
    };
  }
}

module.exports = new BiometricoService();