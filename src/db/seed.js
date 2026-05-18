const prisma = require('./prisma');

prisma.$connect().then(() => {
  console.log('Conexión a la base de datos establecida');
  const planesData = [
    { nombre: 'Mensualidad Básica', descripcion: 'Acceso a todas las áreas del gimnasio', costo: 35.00, diasDuracion: 30 },
    { nombre: 'Trimestre VIP', descripcion: 'Acceso VIP + 2 sesiones con entrenador personal', costo: 90.00, diasDuracion: 90 },
    { nombre: 'Pase Diario', descripcion: 'Acceso por un día', costo: 10.00, diasDuracion: 1 },
    { nombre: 'Anual Premium', descripcion: 'Acceso por un año + beneficios exclusivos', costo: 350.00, diasDuracion: 365 }
  ];

  for (const planData of planesData) {
    const existing = prisma.suscripcion.findFirst({
      where: { nombre: planData.nombre }
    });
    
    if (!existing) {
      prisma.suscripcion.create({ data: planData });
      console.log(` Plan "${planData.nombre}" creado`);
    } else {
      console.log(`⚠ Plan "${planData.nombre}" ya existe`);
    }
  }

  // ==================== MEMBRESÍA PARA CLIENTE DE EJEMPLO ====================
  const cliente = prisma.cliente.findFirst({
    where: { cedula: 'V-12345678' }
  });

  const planBasico = prisma.suscripcion.findFirst({
    where: { nombre: 'Mensualidad Básica' }
  });

  if (cliente && planBasico) {
    const existingMembresia = prisma.membresia.findFirst({
      where: { idCliente: cliente.id }
    });
  
  if (!existingMembresia) {
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + planBasico.diasDuracion);
    
    prisma.membresia.create({
      data: {
        idCliente: cliente.id,
        idSuscripcion: planBasico.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: 'ACTIVA'
      }
    });
    console.log(' Membresía creada para cliente de ejemplo');
  } else {
    console.log(' El cliente de ejemplo ya tiene una membresía');
  }
  }

  // ==================== PAGOS DE EJEMPLO ====================
  const membresia = prisma.membresia.findFirst({
    where: { estado: 'ACTIVA' }
  });

  if (membresia) {
    const existingPago = prisma.pago.findFirst({
      where: { idMembresia: membresia.id }
    });

    if (!existingPago) {
      prisma.pago.create({
        data: {
          idMembresia: membresia.id,
          monto: 35.00,
          fechaPago: new Date(),
          metodoPago: 'EFECTIVO'
        }
      });
      console.log(' Pago creado para membresía de ejemplo');
    } else {
      console.log(' La membresía de ejemplo ya tiene un pago');
    }
  } else {
    console.log(' No se encontró una membresía activa para crear un pago de ejemplo');
  }

}).catch((error) => {
  console.error('Error al conectar a la base de datos:', error);
});
