const dotenv = require('dotenv');
dotenv.config();
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log(' Iniciando seeding...');

  try {
    await prisma.$connect();
    console.log(' Conectado a PostgreSQL');

    // ==================== 1. ROLES ====================
    console.log('\n Creando roles...');
    const roles = await Promise.all([
      prisma.rol.upsert({
        where: { nombre: 'ADMIN' },
        update: {},
        create: { nombre: 'ADMIN', descripcion: 'Administrador del sistema - Acceso total' }
      }),
      prisma.rol.upsert({
        where: { nombre: 'FINANZAS' },
        update: {},
        create: { nombre: 'FINANZAS', descripcion: 'Módulo de finanzas y pagos' }
      }),
      prisma.rol.upsert({
        where: { nombre: 'ENTRENADOR' },
        update: {},
        create: { nombre: 'ENTRENADOR', descripcion: 'Entrenador del gimnasio' }
      }),
      prisma.rol.upsert({
        where: { nombre: 'CLIENTE' },
        update: {},
        create: { nombre: 'CLIENTE', descripcion: 'Cliente del gimnasio' }
      }),
      prisma.rol.upsert({
        where: { nombre: 'RECEPCIONISTA' },
        update: {},
        create: { nombre: 'RECEPCIONISTA', descripcion: 'Atención al cliente y control de accesos' }
      }),
      prisma.rol.upsert({
        where: { nombre: 'MANTENIMIENTO' },
        update: {},
        create: { nombre: 'MANTENIMIENTO', descripcion: 'Encargado de mantenimiento de máquinas' }
      })
    ]);
    console.log(` ${roles.length} roles creados/actualizados`);

    // ==================== 2. USUARIOS ====================
    console.log('\n Creando usuarios...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const finanzasPassword = await bcrypt.hash('finanzas123', 10);
    const entrenadorPassword = await bcrypt.hash('entrenador123', 10);
    const clientePassword = await bcrypt.hash('cliente123', 10);
    const recepcionistaPassword = await bcrypt.hash('recepcion123', 10);
    const mantenimientoPassword = await bcrypt.hash('mantenimiento123', 10);

    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@smartgym.com' },
      update: {},
      create: {
        email: 'admin@smartgym.com',
        password: adminPassword,
        idRol: roles.find(r => r.nombre === 'ADMIN').id,
        estado: 'ACTIVO',
        descripcion: 'Administrador principal del sistema'
      }
    });
    console.log(' Usuario ADMIN creado');

    const finanzas = await prisma.usuario.upsert({
      where: { email: 'finanzas@smartgym.com' },
      update: {},
      create: {
        email: 'finanzas@smartgym.com',
        password: finanzasPassword,
        idRol: roles.find(r => r.nombre === 'FINANZAS').id,
        estado: 'ACTIVO',
        descripcion: 'Encargado de finanzas y pagos'
      }
    });
    console.log(' Usuario FINANZAS creado');

    const recepcionista = await prisma.usuario.upsert({
      where: { email: 'recepcion@smartgym.com' },
      update: {},
      create: {
        email: 'recepcion@smartgym.com',
        password: recepcionistaPassword,
        idRol: roles.find(r => r.nombre === 'RECEPCIONISTA').id,
        estado: 'ACTIVO',
        descripcion: 'Recepcionista del gimnasio'
      }
    });
    console.log(' Usuario RECEPCIONISTA creado');

    const mantenimiento = await prisma.usuario.upsert({
      where: { email: 'mantenimiento@smartgym.com' },
      update: {},
      create: {
        email: 'mantenimiento@smartgym.com',
        password: mantenimientoPassword,
        idRol: roles.find(r => r.nombre === 'MANTENIMIENTO').id,
        estado: 'ACTIVO',
        descripcion: 'Encargado de mantenimiento de máquinas'
      }
    });
    console.log(' Usuario MANTENIMIENTO creado');

    // ==================== 3. CLIENTES ====================
    console.log('\n Creando clientes...');

    // Cliente 1
    const cliente1 = await prisma.usuario.upsert({
      where: { email: 'juan.perez@smartgym.com' },
      update: {},
      create: {
        email: 'juan.perez@smartgym.com',
        password: clientePassword,
        idRol: roles.find(r => r.nombre === 'CLIENTE').id,
        estado: 'ACTIVO',
        descripcion: 'Cliente regular'
      }
    });

    const clienteData1 = await prisma.cliente.upsert({
      where: { cedula: 'V-12345678' }, 
      update: {},
      create: {
        idUsuario: cliente1.id,
        cedula: 'V-12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '04121234567'
      }
    });

    // Cliente 2
    const cliente2 = await prisma.usuario.upsert({
      where: { email: 'maria.garcia@smartgym.com' },
      update: {},
      create: {
        email: 'maria.garcia@smartgym.com',
        password: clientePassword,
        idRol: roles.find(r => r.nombre === 'CLIENTE').id,
        estado: 'ACTIVO',
        descripcion: 'Cliente VIP'
      }
    });

    const clienteData2 = await prisma.cliente.upsert({
      where: { cedula: 'V-87654321' },  
      update: {},
      create: {
        idUsuario: cliente2.id,
        cedula: 'V-87654321',
        nombre: 'María',
        apellido: 'García',
        telefono: '04129876543'
      }
    });

    console.log(' 2 clientes creados');

    // ==================== 4. ENTRENADORES ====================
    console.log('\n Creando entrenadores...');

    // Entrenador 1
    const entrenador1Usuario = await prisma.usuario.upsert({
      where: { email: 'laura.gomez@smartgym.com' },
      update: {},
      create: {
        email: 'laura.gomez@smartgym.com',
        password: entrenadorPassword,
        idRol: roles.find(r => r.nombre === 'ENTRENADOR').id,
        estado: 'ACTIVO',
        descripcion: 'Entrenadora especializada en yoga y pilates'
      }
    });

    const entrenadorData1 = await prisma.entrenador.upsert({
      where: { id: 1 },  
      update: {},
      create: {
        idUsuario: entrenador1Usuario.id,
        especialidad: 'Yoga, Pilates y Meditación'
      }
    });

    // Entrenador 2
    const entrenador2Usuario = await prisma.usuario.upsert({
      where: { email: 'carlos.ruiz@smartgym.com' },
      update: {},
      create: {
        email: 'carlos.ruiz@smartgym.com',
        password: entrenadorPassword,
        idRol: roles.find(r => r.nombre === 'ENTRENADOR').id,
        estado: 'ACTIVO',
        descripcion: 'Entrenador de fuerza y crossfit'
      }
    });

    const entrenadorData2 = await prisma.entrenador.upsert({
      where: { id: 2 },  
      update: {},
      create: {
        idUsuario: entrenador2Usuario.id,
        especialidad: 'Crossfit, Pesas y Cardio'
      }
    });

    console.log(' 2 entrenadores creados');

    // ==================== 5. CATEGORÍAS DE MÁQUINAS ====================
    console.log('\n Creando categorías de máquinas...');
    
    const categorias = await Promise.all([
      prisma.categoriaDeMaquina.upsert({
        where: { nombre: 'Cardiovascular' },
        update: {},
        create: { nombre: 'Cardiovascular', descripcion: 'Máquinas para ejercicio cardiovascular' }
      }),
      prisma.categoriaDeMaquina.upsert({
        where: { nombre: 'Musculación' },
        update: {},
        create: { nombre: 'Musculación', descripcion: 'Máquinas para entrenamiento de fuerza' }
      }),
      prisma.categoriaDeMaquina.upsert({
        where: { nombre: 'Peso Libre' },
        update: {},
        create: { nombre: 'Peso Libre', descripcion: 'Área de pesas libres y mancuernas' }
      })
    ]);
    console.log(` ${categorias.length} categorías creadas`);

    // ==================== 6. MÁQUINAS ====================
    console.log('\n Creando máquinas...');
    
    const maquinas = [
      { codigo: 1001, nombre: 'Cinta Correr T9000', idCategoria: categorias[0].id, descripcion: 'Cinta eléctrica con inclinación, velocidad máxima 20 km/h', estado: 'ACTIVA' },
      { codigo: 1002, nombre: 'Bicicleta Estática', idCategoria: categorias[0].id, descripcion: 'Bicicleta de spinning con resistencia ajustable', estado: 'ACTIVA' },
      { codigo: 1003, nombre: 'Elíptica', idCategoria: categorias[0].id, descripcion: 'Máquina elíptica de bajo impacto', estado: 'ACTIVA' },
      { codigo: 2001, nombre: 'Prensa Horizontal', idCategoria: categorias[1].id, descripcion: 'Máquina para ejercicios de piernas', estado: 'ACTIVA' },
      { codigo: 2002, nombre: 'Polea Multifunción', idCategoria: categorias[1].id, descripcion: 'Polea para espalda y hombros', estado: 'MANTENIMIENTO' },
      { codigo: 2003, nombre: 'Máquina de Pecho', idCategoria: categorias[1].id, descripcion: 'Máquina para pectorales', estado: 'ACTIVA' },
      { codigo: 3001, nombre: 'Set Mancuernas', idCategoria: categorias[2].id, descripcion: 'Mancuernas desde 1kg hasta 30kg', estado: 'ACTIVA' },
      { codigo: 3002, nombre: 'Barras Olímpicas', idCategoria: categorias[2].id, descripcion: 'Barras para press de banca y sentadillas', estado: 'ACTIVA' },
      { codigo: 3003, nombre: 'Discos de Pesas', idCategoria: categorias[2].id, descripcion: 'Discos desde 2.5kg hasta 25kg', estado: 'ACTIVA' }
    ];

    for (const maquina of maquinas) {
      await prisma.maquina.upsert({
        where: { codigo: maquina.codigo },
        update: {},
        create: maquina
      });
    }
    console.log(` ${maquinas.length} máquinas creadas`);

    // ==================== 7. PLANES DE SUSCRIPCIÓN ====================
    console.log('\n Creando planes de suscripción...');
    
    const planes = await Promise.all([
      prisma.suscripcion.upsert({
        where: { id: 1 },
        update: {},
        create: { nombre: 'Mensualidad Básica', descripcion: 'Acceso a todas las áreas del gimnasio', costo: 35.00, diasDuracion: 30 }
      }),
      prisma.suscripcion.upsert({
        where: { id: 2 },
        update: {},
        create: { nombre: 'Trimestre VIP', descripcion: 'Acceso VIP + 2 sesiones con entrenador personal', costo: 90.00, diasDuracion: 90 }
      }),
      prisma.suscripcion.upsert({
        where: { id: 3 },
        update: {},
        create: { nombre: 'Pase Diario', descripcion: 'Acceso por un día', costo: 10.00, diasDuracion: 1 }
      }),
      prisma.suscripcion.upsert({
        where: { id: 4 },
        update: {},
        create: { nombre: 'Anual Premium', descripcion: 'Acceso por un año + beneficios exclusivos', costo: 350.00, diasDuracion: 365 }
      })
    ]);
    console.log(` ${planes.length} planes creados`);

    // ==================== 8. MEMBRESÍAS ====================
    console.log('\n Creando membresías...');
    
    const fechaInicio = new Date();
    const fechaFinMensual = new Date();
    fechaFinMensual.setDate(fechaFinMensual.getDate() + 30);
    
    const fechaFinTrimestre = new Date();
    fechaFinTrimestre.setDate(fechaFinTrimestre.getDate() + 90);

    await prisma.membresia.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idCliente: clienteData1.id,
        idSuscripcion: planes[0].id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFinMensual,
        estado: 'ACTIVA'
      }
    });

    await prisma.membresia.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idCliente: clienteData2.id,
        idSuscripcion: planes[1].id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFinTrimestre,
        estado: 'ACTIVA'
      }
    });
    console.log(' 2 membresías creadas');

    // ==================== 9. PRODUCTOS DE TIENDA ====================
    console.log('\n Creando productos de tienda...');
    
    const productos = [
      { nombre: 'Proteína Whey', descripcion: 'Suplemento proteico de suero de leche, 2lb', precio: 45.00, stock: 50 },
      { nombre: 'Botella de Agua', descripcion: 'Botella deportiva de 1 litro', precio: 8.00, stock: 100 },
      { nombre: 'Toalla Deportiva', descripcion: 'Toalla de microfibra absorbente', precio: 12.00, stock: 80 },
      { nombre: 'Guantes de Entrenamiento', descripcion: 'Guantes para levantamiento de pesas', precio: 25.00, stock: 40 },
      { nombre: 'Shaker', descripcion: 'Vaso mezclador para proteínas', precio: 10.00, stock: 60 }
    ];

    for (const producto of productos) {
      await prisma.producto.upsert({
        where: { id: 0 },
        update: {},
        create: producto
      });
    }
    console.log(` ${productos.length} productos creados`);

    // ==================== 10. DISCIPLINAS ====================
    console.log('\n Creando disciplinas...');
    
    const disciplinas = await Promise.all([
      prisma.disciplina.upsert({
        where: { id: 1 },
        update: {},
        create: { 
          nombre: 'Ciclismo', 
          descripcion: 'Ciclismo indoor de alta intensidad, mejora resistencia cardiovascular' 
        }
      }),
      prisma.disciplina.upsert({
        where: { id: 2 },
        update: {},
        create: { 
          nombre: 'Meditación y Flexibilidad', 
          descripcion: 'Yoga y meditación para relajación, mejorar flexibilidad y reducir estrés' 
        }
      }),
      prisma.disciplina.upsert({
        where: { id: 3 },
        update: {},
        create: { 
          nombre: 'Entrenamiento Funcional', 
          descripcion: 'Crossfit de alta intensidad, mejora fuerza y resistencia' 
        }
      }),
      prisma.disciplina.upsert({
        where: { id: 4 },
        update: {},
        create: { 
          nombre: 'Fortalecimiento', 
          descripcion: 'Pilates para fortalecimiento muscular y mejora de postura' 
        }
      }),
      prisma.disciplina.upsert({
        where: { id: 5 },
        update: {},
        create: { 
          nombre: 'Baile y Cardio', 
          descripcion: 'Zumba con ritmos latinos, cardio divertido' 
        }
      })
    ]);
    console.log(` ${disciplinas.length} disciplinas creadas`);

    // ==================== 11. SESIONES (CLASES) ====================
    console.log('\n Creando sesiones...');
    
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const semana = new Date(hoy);
    semana.setDate(semana.getDate() + 7);

    const sesionesData = [
      {
        nombre: 'Spinning',
        idDisciplina: disciplinas[0].id,
        idEntrenador: entrenadorData1.id,
        fecha: manana,
        horaInicio: new Date(`${manana.toISOString().split('T')[0]}T08:00:00`),
        horaFin: new Date(`${manana.toISOString().split('T')[0]}T09:00:00`),
        limiteDeCupos: 20,
        estado: 'PROGRAMADA'
      },
      {
        nombre: 'Yoga',
        idDisciplina: disciplinas[1].id,
        idEntrenador: entrenadorData1.id,
        fecha: manana,
        horaInicio: new Date(`${manana.toISOString().split('T')[0]}T10:00:00`),
        horaFin: new Date(`${manana.toISOString().split('T')[0]}T11:00:00`),
        limiteDeCupos: 15,
        estado: 'PROGRAMADA'
      },
      {
        nombre: 'Crossfit',
        idDisciplina: disciplinas[2].id,
        idEntrenador: entrenadorData2.id,
        fecha: manana,
        horaInicio: new Date(`${manana.toISOString().split('T')[0]}T17:00:00`),
        horaFin: new Date(`${manana.toISOString().split('T')[0]}T18:00:00`),
        limiteDeCupos: 25,
        estado: 'PROGRAMADA'
      },
      {
        nombre: 'Pilates',
        idDisciplina: disciplinas[3].id,
        idEntrenador: entrenadorData1.id,
        fecha: semana,
        horaInicio: new Date(`${semana.toISOString().split('T')[0]}T09:00:00`),
        horaFin: new Date(`${semana.toISOString().split('T')[0]}T10:00:00`),
        limiteDeCupos: 12,
        estado: 'PROGRAMADA'
      },
      {
        nombre: 'Zumba',
        idDisciplina: disciplinas[4].id,
        idEntrenador: entrenadorData2.id,
        fecha: semana,
        horaInicio: new Date(`${semana.toISOString().split('T')[0]}T18:00:00`),
        horaFin: new Date(`${semana.toISOString().split('T')[0]}T19:00:00`),
        limiteDeCupos: 30,
        estado: 'PROGRAMADA'
      }
    ];

    for (const sesion of sesionesData) {
      await prisma.sesion.create({
        data: sesion
      });
    }
    console.log(` ${sesionesData.length} sesiones creadas`);

    // ==================== 12. RESERVAS ====================
    console.log('\n Creando reservas...');
    
    const sesionesExistentes = await prisma.sesion.findMany({ take: 2 });
    
    for (let i = 0; i < sesionesExistentes.length; i++) {
      await prisma.reserva.upsert({
        where: { id: i + 1 },
        update: {},
        create: {
          idCliente: clienteData1.id,
          idSesion: sesionesExistentes[i].id,
          fecha: new Date(),
          estado: 'ACTIVA'
        }
      });
    }
    console.log(' 2 reservas creadas');

    // ==================== 13. TICKETS DE MANTENIMIENTO ====================
    console.log('\n Creando tickets de mantenimiento...');
    
    const maquinaMantenimiento = await prisma.maquina.findFirst({
      where: { estado: 'MANTENIMIENTO' }
    });

    if (maquinaMantenimiento) {
      await prisma.ticketMantenimiento.upsert({
        where: { id: 1 },
        update: {},
        create: {
          idMaquina: maquinaMantenimiento.id,
          idUsuario: mantenimiento.id,
          fechaFalla: new Date(),
          descripcionFalla: 'La polea hace ruido extraño y necesita lubricación'
        }
      });
      console.log(' 1 ticket de mantenimiento creado');
    }

    // ==================== 14. CONTROL DE ACCESOS ====================
    console.log('\n Creando registros de control de accesos...');
    
    await prisma.controlAcceso.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idCliente: clienteData1.id,
        fechaHoraEntrada: new Date(),
        estadoAcceso: 'PERMITIDO',
        motivoRechazo: null
      }
    });

    await prisma.controlAcceso.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idCliente: clienteData2.id,
        fechaHoraEntrada: new Date(),
        estadoAcceso: 'PERMITIDO',
        motivoRechazo: null
      }
    });
    console.log(' 2 registros de acceso creados');

    // ==================== 15. EVALUACIONES BIOMÉTRICAS ====================
    console.log('\n Creando evaluaciones biométricas...');
    
    await prisma.evaluacionBiometrica.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idCliente: clienteData1.id,
        idEntrenador: entrenadorData1.id,
        fechaEvaluacion: new Date(),
        peso: 75.5,
        estatura: 1.75,
        porcentajeGrasa: 18.5,
        observaciones: 'Buena evolución, mantener rutina actual'
      }
    });

    await prisma.evaluacionBiometrica.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idCliente: clienteData2.id,
        idEntrenador: entrenadorData2.id,
        fechaEvaluacion: new Date(),
        peso: 62.3,
        estatura: 1.65,
        porcentajeGrasa: 22.0,
        observaciones: 'Primera evaluación, empezar con rutina suave'
      }
    });
    console.log(' 2 evaluaciones biométricas creadas');

    // ==================== 16. COMPRAS (VENTAS) ====================
    console.log('\n Creando compras/ventas...');
    
    const productosExistentes = await prisma.producto.findMany({ take: 2 });
    const montoTotal = productosExistentes.reduce((sum, p) => sum + p.precio, 0);

    const compra = await prisma.compra.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idCliente: clienteData1.id,
        fecha: new Date(),
        monto: montoTotal
      }
    });

    for (const producto of productosExistentes) {
      await prisma.detalleCompra.upsert({
        where: { id: producto.id },
        update: {},
        create: {
          idCompra: compra.id,
          idProducto: producto.id,
          cantidad: 1,
          precioUnitario: producto.precio
        }
      });
    }
    console.log(' 1 compra con detalles creada');

    // ==================== 17. PAGOS ====================
    console.log('\n Creando pagos...');
    
    const membresiaActiva = await prisma.membresia.findFirst({
      where: { estado: 'ACTIVA' }
    });

    if (membresiaActiva) {
      await prisma.pago.upsert({
        where: { id: 1 },
        update: {},
        create: {
          idMembresia: membresiaActiva.id,
          monto: 35.00,
          fechaPago: new Date(),
          metodoPago: 'TRANSFERENCIA'
        }
      });
      console.log(' 1 pago registrado');
    }

    console.log('\n ========== SEEDING COMPLETADO CON ÉXITO ==========');
    console.log('\n Credenciales de prueba:');
    console.log('   ADMIN:       admin@smartgym.com / admin123');
    console.log('   FINANZAS:    finanzas@smartgym.com / finanzas123');
    console.log('   ENTRENADOR:  laura.gomez@smartgym.com / entrenador123');
    console.log('   ENTRENADOR:  carlos.ruiz@smartgym.com / entrenador123');
    console.log('   CLIENTE:     juan.perez@smartgym.com / cliente123');
    console.log('   CLIENTE:     maria.garcia@smartgym.com / cliente123');
    console.log('   RECEPCION:   recepcion@smartgym.com / recepcion123');
    console.log('   MANTENIMIENTO: mantenimiento@smartgym.com / mantenimiento123');

  } catch (error) {
    console.error(' Error en seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();