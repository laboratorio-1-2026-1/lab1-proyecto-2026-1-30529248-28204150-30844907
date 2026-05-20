const dotenv = require('dotenv');
dotenv.config();
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log(' Iniciando seeding completo...');
  console.log('=' .repeat(60));

  try {
    await prisma.$connect();
    console.log(' Conectado a PostgreSQL\n');

    // ==================== 1. ROLES ====================
    console.log(' Creando ROLES...');
    const rolesData = [
      { nombre: 'ADMIN', descripcion: 'Administrador del sistema - Acceso total' },
      { nombre: 'FINANZAS', descripcion: 'Módulo de finanzas - Gestión de pagos y membresías' },
      { nombre: 'ENTRENADOR', descripcion: 'Entrenador del gimnasio - Dicta clases y evaluaciones' },
      { nombre: 'CLIENTE', descripcion: 'Cliente del gimnasio - Reserva clases y accede al gimnasio' },
      { nombre: 'RECEPCIONISTA', descripcion: 'Atención al cliente - Control de acceso y ventas' },
      { nombre: 'MANTENIMIENTO', descripcion: 'Mantenimiento de máquinas - Reporta y repara equipos' }
    ];

    const roles = {};
    for (const rolData of rolesData) {
      let rol = await prisma.rol.findFirst({ where: { nombre: rolData.nombre } });
      if (!rol) {
        rol = await prisma.rol.create({ data: rolData });
        console.log(`    Rol "${rolData.nombre}" creado`);
      } else {
        console.log(`    Rol "${rolData.nombre}" ya existe`);
      }
      roles[rol.nombre] = rol;
    }

    // ==================== 2. USUARIOS ====================
    console.log('\n📌 Creando USUARIOS...');
    
    const usuariosData = [
      // Admins
      { email: 'admin@smartgym.com', password: 'admin123', rol: 'ADMIN', descripcion: 'Administrador principal' },
      { email: 'admin2@smartgym.com', password: 'admin123', rol: 'ADMIN', descripcion: 'Administrador secundario' },
      
      // Finanzas
      { email: 'finanzas@smartgym.com', password: 'finanzas123', rol: 'FINANZAS', descripcion: 'Encargado de finanzas' },
      { email: 'contador@smartgym.com', password: 'contador123', rol: 'FINANZAS', descripcion: 'Contador general' },
      
      // Entrenadores
      { email: 'entrenador@smartgym.com', password: 'entrenador123', rol: 'ENTRENADOR', descripcion: 'Entrenador principal' },
      { email: 'carlos.pérez@smartgym.com', password: 'entrenador123', rol: 'ENTRENADOR', descripcion: 'Especialista en spinning' },
      { email: 'laura.gomez@smartgym.com', password: 'entrenador123', rol: 'ENTRENADOR', descripcion: 'Especialista en yoga' },
      { email: 'miguel.rojas@smartgym.com', password: 'entrenador123', rol: 'ENTRENADOR', descripcion: 'Especialista en crossfit' },
      { email: 'ana.torres@smartgym.com', password: 'entrenador123', rol: 'ENTRENADOR', descripcion: 'Especialista en pilates' },
      
      // Clientes
      { email: 'cliente@smartgym.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente regular' },
      { email: 'juan.perez@gmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente desde enero 2024' },
      { email: 'maria.lopez@gmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente premium' },
      { email: 'pedro.ramirez@hotmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente frecuente' },
      { email: 'lucia.fernandez@gmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente nuevo' },
      { email: 'roberto.mendoza@yahoo.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente con membresía anual' },
      { email: 'sofia.vargas@gmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente desde marzo 2024' },
      { email: 'diego.silva@hotmail.com', password: 'cliente123', rol: 'CLIENTE', descripcion: 'Cliente estudiante' },
      
      // Recepcionistas
      { email: 'recepcion@smartgym.com', password: 'recepcion123', rol: 'RECEPCIONISTA', descripcion: 'Recepcionista turno mañana' },
      { email: 'carmen.diaz@smartgym.com', password: 'recepcion123', rol: 'RECEPCIONISTA', descripcion: 'Recepcionista turno tarde' },
      
      // Mantenimiento
      { email: 'mantenimiento@smartgym.com', password: 'mantenimiento123', rol: 'MANTENIMIENTO', descripcion: 'Técnico principal' },
      { email: 'luis.garcia@smartgym.com', password: 'mantenimiento123', rol: 'MANTENIMIENTO', descripcion: 'Técnico eléctrico' }
    ];

    const usuarios = {};
    const clientes = {};
    const entrenadores = {};

    for (const userData of usuariosData) {
      let usuario = await prisma.usuario.findFirst({ where: { email: userData.email } });
      
      if (!usuario) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        usuario = await prisma.usuario.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            idRol: roles[userData.rol].id,
            estado: 'ACTIVO',
            descripcion: userData.descripcion
          }
        });
        console.log(`    Usuario ${userData.email} (${userData.rol}) creado`);
      } else {
        console.log(`    Usuario ${userData.email} ya existe`);
      }
      
      usuarios[userData.email] = usuario;
    }

    // ==================== 3. CLIENTES (datos específicos) ====================
    console.log('\n Creando datos específicos de CLIENTES...');
    
    const clientesData = [
      { email: 'cliente@smartgym.com', cedula: 'V-12345678', nombre: 'Cliente', apellido: 'Prueba', telefono: '04129876543' },
      { email: 'juan.perez@gmail.com', cedula: 'V-87654321', nombre: 'Juan', apellido: 'Pérez', telefono: '04141234567' },
      { email: 'maria.lopez@gmail.com', cedula: 'V-11223344', nombre: 'María', apellido: 'López', telefono: '04249876543' },
      { email: 'pedro.ramirez@hotmail.com', cedula: 'V-44332211', nombre: 'Pedro', apellido: 'Ramírez', telefono: '04167891234' },
      { email: 'lucia.fernandez@gmail.com', cedula: 'V-55667788', nombre: 'Lucía', apellido: 'Fernández', telefono: '04245678912' },
      { email: 'roberto.mendoza@yahoo.com', cedula: 'V-99887766', nombre: 'Roberto', apellido: 'Mendoza', telefono: '04126783456' },
      { email: 'sofia.vargas@gmail.com', cedula: 'V-33445566', nombre: 'Sofía', apellido: 'Vargas', telefono: '04249871234' },
      { email: 'diego.silva@hotmail.com', cedula: 'V-77665544', nombre: 'Diego', apellido: 'Silva', telefono: '04127893456' }
    ];

    for (const clienteData of clientesData) {
      const usuario = usuarios[clienteData.email];
      if (!usuario) continue;
      
      let cliente = await prisma.cliente.findFirst({ where: { idUsuario: usuario.id } });
      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: {
            idUsuario: usuario.id,
            cedula: clienteData.cedula,
            nombre: clienteData.nombre,
            apellido: clienteData.apellido,
            telefono: clienteData.telefono
          }
        });
        console.log(`    Cliente ${clienteData.nombre} ${clienteData.apellido} creado`);
      }
      clientes[usuario.id] = cliente;
    }

    // ==================== 4. ENTRENADORES (datos específicos) ====================
    console.log('\n Creando datos específicos de ENTRENADORES...');
    
    const entrenadoresData = [
      { email: 'entrenador@smartgym.com', especialidad: 'Entrenamiento funcional' },
      { email: 'carlos.perez@smartgym.com', especialidad: 'Spinning y ciclismo' },
      { email: 'laura.gomez@smartgym.com', especialidad: 'Yoga y meditación' },
      { email: 'miguel.rojas@smartgym.com', especialidad: 'Crossfit avanzado' },
      { email: 'ana.torres@smartgym.com', especialidad: 'Pilates y rehabilitación' }
    ];

    for (const entrenadorData of entrenadoresData) {
      const usuario = usuarios[entrenadorData.email];
      if (!usuario) continue;
      
      let entrenador = await prisma.entrenador.findFirst({ where: { idUsuario: usuario.id } });
      if (!entrenador) {
        entrenador = await prisma.entrenador.create({
          data: {
            idUsuario: usuario.id,
            especialidad: entrenadorData.especialidad
          }
        });
        console.log(`    Entrenador ${entrenadorData.especialidad} creado`);
      }
      entrenadores[usuario.id] = entrenador;
    }

    // ==================== 5. CATEGORÍAS DE MÁQUINAS ====================
    console.log('\n Creando CATEGORÍAS DE MÁQUINAS...');
    
    const categoriasData = [
      { nombre: 'Cardiovascular', descripcion: 'Máquinas para ejercicio cardiovascular (cintas, elípticas, bicicletas)' },
      { nombre: 'Fuerza', descripcion: 'Máquinas para entrenamiento de fuerza y musculación' },
      { nombre: 'Pesas Libres', descripcion: 'Barras, mancuernas, discos y accesorios' },
      { nombre: 'Funcional', descripcion: 'Equipo para entrenamiento funcional (TRX, kettlebells, cuerdas)' },
      { nombre: 'Estiramiento', descripcion: 'Área de estiramiento y movilidad (colchonetas, foam rollers)' }
    ];

    const categorias = {};
    for (const catData of categoriasData) {
      let categoria = await prisma.categoriaDeMaquina.findFirst({ where: { nombre: catData.nombre } });
      if (!categoria) {
        categoria = await prisma.categoriaDeMaquina.create({ data: catData });
        console.log(`    Categoría "${catData.nombre}" creada`);
      } else {
        console.log(`    Categoría "${catData.nombre}" ya existe`);
      }
      categorias[catData.nombre] = categoria;
    }

    // ==================== 6. MÁQUINAS ====================
    console.log('\n Creando MÁQUINAS...');
    
    const maquinasData = [
      // Cardiovasculares
      { codigo: 1001, nombre: 'Cinta Correr T9000', categoria: 'Cardiovascular', descripcion: 'Cinta eléctrica con inclinación y programas predefinidos', estado: 'ACTIVA' },
      { codigo: 1002, nombre: 'Cinta Correr Pro', categoria: 'Cardiovascular', descripcion: 'Cinta para running profesional', estado: 'ACTIVA' },
      { codigo: 1003, nombre: 'Elíptica E5', categoria: 'Cardiovascular', descripcion: 'Elíptica de bajo impacto', estado: 'ACTIVA' },
      { codigo: 1004, nombre: 'Elíptica E7', categoria: 'Cardiovascular', descripcion: 'Elíptica con resistencia magnética', estado: 'MANTENIMIENTO' },
      { codigo: 1005, nombre: 'Bicicleta Spinning Pro', categoria: 'Cardiovascular', descripcion: 'Bicicleta para spinning con monitor', estado: 'ACTIVA' },
      { codigo: 1006, nombre: 'Bicicleta Recumbente', categoria: 'Cardiovascular', descripcion: 'Bicicleta reclinada para rehabilitación', estado: 'ACTIVA' },
      { codigo: 1007, nombre: 'Remadora R2000', categoria: 'Cardiovascular', descripcion: 'Máquina de remo con resistencia de agua', estado: 'FUERA_SERVICIO' },
      { codigo: 1008, nombre: 'Escaladora StairMaster', categoria: 'Cardiovascular', descripcion: 'Simulador de escaleras', estado: 'ACTIVA' },
      
      // Fuerza
      { codigo: 2001, nombre: 'Prensa de Piernas', categoria: 'Fuerza', descripcion: 'Máquina para entrenamiento de piernas', estado: 'ACTIVA' },
      { codigo: 2002, nombre: 'Polea Multifuncional', categoria: 'Fuerza', descripcion: 'Polea con múltiples agarres', estado: 'ACTIVA' },
      { codigo: 2003, nombre: 'Máquina de Pecho', categoria: 'Fuerza', descripcion: 'Press de pecho guiado', estado: 'ACTIVA' },
      { codigo: 2004, nombre: 'Máquina de Hombros', categoria: 'Fuerza', descripcion: 'Press militar guiado', estado: 'MANTENIMIENTO' },
      { codigo: 2005, nombre: 'Máquina de Espalda', categoria: 'Fuerza', descripcion: 'Máquina de jalón al pecho', estado: 'ACTIVA' },
      { codigo: 2006, nombre: 'Máquina de Cuádriceps', categoria: 'Fuerza', descripcion: 'Extensión de piernas', estado: 'ACTIVA' },
      { codigo: 2007, nombre: 'Máquina de Femoral', categoria: 'Fuerza', descripcion: 'Curl de piernas', estado: 'ACTIVA' },
      { codigo: 2008, nombre: 'Máquina de Gemelos', categoria: 'Fuerza', descripcion: 'Elevación de talones', estado: 'ACTIVA' },
      
      // Pesas Libres
      { codigo: 3001, nombre: 'Set Mancuernas 1-20kg', categoria: 'Pesas Libres', descripcion: 'Set completo de mancuernas hexagonales', estado: 'ACTIVA' },
      { codigo: 3002, nombre: 'Barras Olímpicas', categoria: 'Pesas Libres', descripcion: 'Barras de 20kg para levantamiento', estado: 'ACTIVA' },
      { codigo: 3003, nombre: 'Discos 25kg', categoria: 'Pesas Libres', descripcion: 'Pares de discos de 25kg', estado: 'ACTIVA' },
      { codigo: 3004, nombre: 'Kettlebells', categoria: 'Pesas Libres', descripcion: 'Set de kettlebells 8-24kg', estado: 'ACTIVA' },
      { codigo: 3005, nombre: 'Bancos Multi-posición', categoria: 'Pesas Libres', descripcion: 'Bancos ajustables para press', estado: 'MANTENIMIENTO' },
      
      // Funcional
      { codigo: 4001, nombre: 'Sistema TRX', categoria: 'Funcional', descripcion: 'Correas de suspensión para entrenamiento', estado: 'ACTIVA' },
      { codigo: 4002, nombre: 'Cuerda Batalla', categoria: 'Funcional', descripcion: 'Cuerda de 15m para entrenamiento', estado: 'ACTIVA' },
      { codigo: 4003, nombre: 'Caja Plométrica', categoria: 'Funcional', descripcion: 'Cajas de diferentes alturas', estado: 'ACTIVA' },
      { codigo: 4004, nombre: 'Balón Medicinal', categoria: 'Funcional', descripcion: 'Balones 3-10kg', estado: 'ACTIVA' },
      
      // Estiramiento
      { codigo: 5001, nombre: 'Colchonetas', categoria: 'Estiramiento', descripcion: 'Colchonetas de yoga', estado: 'ACTIVA' },
      { codigo: 5002, nombre: 'Foam Rollers', categoria: 'Estiramiento', descripcion: 'Rodillos de espuma para liberación miofascial', estado: 'ACTIVA' }
    ];

    const maquinas = {};
    for (const maqData of maquinasData) {
      let maquina = await prisma.maquina.findFirst({ where: { codigo: maqData.codigo } });
      if (!maquina) {
        maquina = await prisma.maquina.create({
          data: {
            codigo: maqData.codigo,
            nombre: maqData.nombre,
            idCategoria: categorias[maqData.categoria].id,
            descripcion: maqData.descripcion,
            estado: maqData.estado
          }
        });
        console.log(`    Máquina "${maqData.nombre}" (código ${maqData.codigo}) creada`);
      }
      maquinas[maqData.codigo] = maquina;
    }

    // ==================== 7. TICKETS DE MANTENIMIENTO ====================
    console.log('\n Creando TICKETS DE MANTENIMIENTO...');
    
    const usuarioMantenimiento = usuarios['mantenimiento@smartgym.com'];
    const usuarioAdmin = usuarios['admin@smartgym.com'];
    
    const ticketsData = [
      { maquinaCodigo: 1004, usuario: usuarioAdmin, fecha: new Date('2024-11-15'), descripcion: 'Ruido excesivo en la banda', fechaResolucion: new Date('2024-11-18'), costo: 150 },
      { maquinaCodigo: 1007, usuario: usuarioMantenimiento, fecha: new Date('2024-12-01'), descripcion: 'Resistencia no funciona', fechaResolucion: null, costo: null },
      { maquinaCodigo: 2004, usuario: usuarioAdmin, fecha: new Date('2024-12-10'), descripcion: 'Polea atascada', fechaResolucion: null, costo: null },
      { maquinaCodigo: 3005, usuario: usuarioMantenimiento, fecha: new Date('2024-12-05'), descripcion: 'Mecanismo de inclinación roto', fechaResolucion: new Date('2024-12-08'), costo: 250 }
    ];

    for (const ticketData of ticketsData) {
      const maquina = maquinas[ticketData.maquinaCodigo];
      if (!maquina) continue;
      
      await prisma.ticketMantenimiento.create({
        data: {
          idMaquina: maquina.id,
          idUsuario: ticketData.usuario.id,
          fechaFalla: ticketData.fecha,
          descripcionFalla: ticketData.descripcion,
          fechaResolucion: ticketData.fechaResolucion,
          costo: ticketData.costo
        }
      });
      console.log(`    Ticket para máquina ${ticketData.maquinaCodigo} creado`);
    }

    // ==================== 8. DISCIPLINAS ====================
    console.log('\n Creando DISCIPLINAS...');
    
    const disciplinasData = [
      { nombre: 'Spinning', descripcion: 'Ciclismo indoor de alta intensidad' },
      { nombre: 'Yoga', descripcion: 'Yoga para flexibilidad y relajación' },
      { nombre: 'Crossfit', descripcion: 'Entrenamiento funcional de alta intensidad' },
      { nombre: 'Pilates', descripcion: 'Control corporal y fortalecimiento del core' },
      { nombre: 'Body Pump', descripcion: 'Entrenamiento con barras y discos' },
      { nombre: 'Zumba', descripcion: 'Baile y cardio' },
      { nombre: 'Boxeo', descripcion: 'Entrenamiento de boxeo y defensa personal' },
      { nombre: 'Funcional', descripcion: 'Entrenamiento con peso corporal y accesorios' }
    ];

    const disciplinas = {};
    for (const discData of disciplinasData) {
      let disciplina = await prisma.disciplina.findFirst({ where: { nombre: discData.nombre } });
      if (!disciplina) {
        disciplina = await prisma.disciplina.create({ data: discData });
        console.log(`    Disciplina "${discData.nombre}" creada`);
      }
      disciplinas[discData.nombre] = disciplina;
    }

    // ==================== 9. SESIONES (clases grupales) ====================
    console.log('\n Creando SESIONES (clases)...');
    
    // Obtener entrenadores registrados
    const entrenadorSpinning = entrenadores[usuarios['carlos.perez@smartgym.com']?.id];
    const entrenadorYoga = entrenadores[usuarios['laura.gomez@smartgym.com']?.id];
    const entrenadorCrossfit = entrenadores[usuarios['miguel.rojas@smartgym.com']?.id];
    const entrenadorPilates = entrenadores[usuarios['ana.torres@smartgym.com']?.id];
    const entrenadorGeneral = entrenadores[usuarios['entrenador@smartgym.com']?.id];
    
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    const semana = new Date(hoy);
    semana.setDate(hoy.getDate() + 7);
    
    const sesionesData = [
      // Spinning
      { disciplina: 'Spinning', entrenador: entrenadorSpinning || entrenadorGeneral, fecha: hoy, horaInicio: '08:00', horaFin: '09:00', cupos: 20, estado: 'PROGRAMADA' },
      { disciplina: 'Spinning', entrenador: entrenadorSpinning || entrenadorGeneral, fecha: hoy, horaInicio: '18:00', horaFin: '19:00', cupos: 20, estado: 'PROGRAMADA' },
      { disciplina: 'Spinning', entrenador: entrenadorSpinning || entrenadorGeneral, fecha: mañana, horaInicio: '10:00', horaFin: '11:00', cupos: 20, estado: 'PROGRAMADA' },
      { disciplina: 'Spinning', entrenador: entrenadorSpinning || entrenadorGeneral, fecha: semana, horaInicio: '19:00', horaFin: '20:00', cupos: 20, estado: 'PROGRAMADA' },
      
      // Yoga
      { disciplina: 'Yoga', entrenador: entrenadorYoga || entrenadorGeneral, fecha: hoy, horaInicio: '09:00', horaFin: '10:30', cupos: 15, estado: 'PROGRAMADA' },
      { disciplina: 'Yoga', entrenador: entrenadorYoga || entrenadorGeneral, fecha: mañana, horaInicio: '08:00', horaFin: '09:30', cupos: 15, estado: 'PROGRAMADA' },
      { disciplina: 'Yoga', entrenador: entrenadorYoga || entrenadorGeneral, fecha: semana, horaInicio: '17:00', horaFin: '18:30', cupos: 15, estado: 'PROGRAMADA' },
      
      // Crossfit
      { disciplina: 'Crossfit', entrenador: entrenadorCrossfit || entrenadorGeneral, fecha: hoy, horaInicio: '07:00', horaFin: '08:30', cupos: 12, estado: 'EN_CURSO' },
      { disciplina: 'Crossfit', entrenador: entrenadorCrossfit || entrenadorGeneral, fecha: mañana, horaInicio: '19:00', horaFin: '20:30', cupos: 12, estado: 'PROGRAMADA' },
      { disciplina: 'Crossfit', entrenador: entrenadorCrossfit || entrenadorGeneral, fecha: semana, horaInicio: '11:00', horaFin: '12:30', cupos: 12, estado: 'PROGRAMADA' },
      
      // Pilates
      { disciplina: 'Pilates', entrenador: entrenadorPilates || entrenadorGeneral, fecha: hoy, horaInicio: '15:00', horaFin: '16:00', cupos: 10, estado: 'PROGRAMADA' },
      { disciplina: 'Pilates', entrenador: entrenadorPilates || entrenadorGeneral, fecha: mañana, horaInicio: '16:00', horaFin: '17:00', cupos: 10, estado: 'PROGRAMADA' },
      
      // Body Pump
      { disciplina: 'Body Pump', entrenador: entrenadorGeneral, fecha: mañana, horaInicio: '18:00', horaFin: '19:00', cupos: 25, estado: 'PROGRAMADA' },
      
      // Zumba
      { disciplina: 'Zumba', entrenador: entrenadorGeneral, fecha: semana, horaInicio: '20:00', horaFin: '21:00', cupos: 30, estado: 'PROGRAMADA' },
      
      // Funcional
      { disciplina: 'Funcional', entrenador: entrenadorCrossfit || entrenadorGeneral, fecha: hoy, horaInicio: '12:00', horaFin: '13:00', cupos: 15, estado: 'FINALIZADA' }
    ];

    const sesiones = [];
    for (const sesData of sesionesData) {
      const disciplina = disciplinas[sesData.disciplina];
      if (!disciplina || !sesData.entrenador) continue;
      
      const fechaObj = new Date(sesData.fecha);
      const horaInicioObj = new Date(fechaObj);
      const [horaInicio, minInicio] = sesData.horaInicio.split(':');
      horaInicioObj.setHours(parseInt(horaInicio), parseInt(minInicio), 0);
      
      const horaFinObj = new Date(fechaObj);
      const [horaFin, minFin] = sesData.horaFin.split(':');
      horaFinObj.setHours(parseInt(horaFin), parseInt(minFin), 0);
      
      const sesion = await prisma.sesion.create({
        data: {
          idDisciplina: disciplina.id,
          idEntrenador: sesData.entrenador.id,
          fecha: fechaObj,
          horaInicio: horaInicioObj,
          horaFin: horaFinObj,
          limiteDeCupos: sesData.cupos,
          estado: sesData.estado
        }
      });
      sesiones.push(sesion);
      console.log(`    Sesión de ${sesData.disciplina} el ${fechaObj.toLocaleDateString()} a las ${sesData.horaInicio} creada`);
    }

    // ==================== 10. RESERVAS ====================
    console.log('\n Creando RESERVAS...');
    
    const listaClientes = Object.values(clientes);
    const reservasData = [
      // Reservas para hoy
      { cliente: listaClientes[0], sesionIndex: 0, estado: 'ACTIVA' },      // Spinning 8am
      { cliente: listaClientes[1], sesionIndex: 0, estado: 'ACTIVA' },
      { cliente: listaClientes[2], sesionIndex: 0, estado: 'ACTIVA' },
      { cliente: listaClientes[3], sesionIndex: 4, estado: 'ACTIVA' },      // Yoga 9am
      { cliente: listaClientes[4], sesionIndex: 4, estado: 'ACTIVA' },
      { cliente: listaClientes[0], sesionIndex: 7, estado: 'ACTIVA' },      // Crossfit 7am
      { cliente: listaClientes[5], sesionIndex: 7, estado: 'ACTIVA' },
      { cliente: listaClientes[6], sesionIndex: 10, estado: 'ACTIVA' },     // Pilates 3pm
      { cliente: listaClientes[1], sesionIndex: 1, estado: 'ACTIVA' },      // Spinning 6pm
      
      // Reservas para mañana
      { cliente: listaClientes[2], sesionIndex: 2, estado: 'ACTIVA' },      // Spinning 10am
      { cliente: listaClientes[3], sesionIndex: 2, estado: 'ACTIVA' },
      { cliente: listaClientes[4], sesionIndex: 5, estado: 'ACTIVA' },      // Yoga 8am
      { cliente: listaClientes[0], sesionIndex: 8, estado: 'ACTIVA' },      // Crossfit 7pm
      { cliente: listaClientes[5], sesionIndex: 8, estado: 'ACTIVA' },
      { cliente: listaClientes[6], sesionIndex: 11, estado: 'ACTIVA' },     // Pilates 4pm
      { cliente: listaClientes[7], sesionIndex: 12, estado: 'ACTIVA' },     // Body Pump 6pm
      
      // Reservas canceladas
      { cliente: listaClientes[0], sesionIndex: 15, estado: 'CANCELADA' },  // Funcional 12pm (pasado)
      { cliente: listaClientes[2], sesionIndex: 1, estado: 'CANCELADA' }    // Spinning 6pm cancelado
    ];

    for (const resData of reservasData) {
      if (!resData.cliente) continue;
      const sesion = sesiones[resData.sesionIndex];
      if (!sesion) continue;
      
      const reservaExistente = await prisma.reserva.findFirst({
        where: { idCliente: resData.cliente.id, idSesion: sesion.id }
      });
      
      if (!reservaExistente) {
        await prisma.reserva.create({
          data: {
            idCliente: resData.cliente.id,
            idSesion: sesion.id,
            fecha: new Date(),
            estado: resData.estado
          }
        });
        console.log(`    Reserva de cliente ${resData.cliente.nombre} para sesión ${sesion.id}`);
      }
    }

    // ==================== 11. CONTROL DE ACCESO ====================
    console.log('\n Creando CONTROL DE ACCESO...');
    
    const accesosData = [
      { cliente: listaClientes[0], fecha: new Date(hoy.setHours(8, 30)), estado: 'ACCESO_CONCEDIDO', motivo: null },
      { cliente: listaClientes[1], fecha: new Date(hoy.setHours(7, 45)), estado: 'ACCESO_CONCEDIDO', motivo: null },
      { cliente: listaClientes[2], fecha: new Date(hoy.setHours(18, 15)), estado: 'ACCESO_CONCEDIDO', motivo: null },
      { cliente: listaClientes[3], fecha: new Date(hoy.setHours(9, 0)), estado: 'ACCESO_DENEGADO', motivo: 'Membresía vencida' },
      { cliente: listaClientes[4], fecha: new Date(hoy.setHours(19, 30)), estado: 'ACCESO_CONCEDIDO', motivo: null },
      { cliente: listaClientes[0], fecha: new Date(mañana.setHours(10, 0)), estado: 'ACCESO_CONCEDIDO', motivo: null },
      { cliente: listaClientes[5], fecha: new Date(mañana.setHours(18, 0)), estado: 'ACCESO_CONCEDIDO', motivo: null }
    ];

    for (const accesoData of accesosData) {
      if (!accesoData.cliente) continue;
      await prisma.controlAcceso.create({
        data: {
          idCliente: accesoData.cliente.id,
          fechaHoraEntrada: accesoData.fecha,
          estadoAcceso: accesoData.estado,
          motivoRechazo: accesoData.motivo
        }
      });
      console.log(`    Registro de acceso para ${accesoData.cliente.nombre}`);
    }

    // ==================== 12. EVALUACIONES BIOMÉTRICAS ====================
    console.log('\n Creando EVALUACIONES BIOMÉTRICAS...');
    
    const evaluacionesData = [
      { cliente: listaClientes[0], entrenador: entrenadorGeneral, fecha: new Date('2024-11-01'), peso: 75.5, estatura: 1.75, grasa: 18.5, observaciones: 'Primera evaluación' },
      { cliente: listaClientes[0], entrenador: entrenadorGeneral, fecha: new Date('2024-12-01'), peso: 73.2, estatura: 1.75, grasa: 16.8, observaciones: 'Progreso positivo' },
      { cliente: listaClientes[1], entrenador: entrenadorCrossfit, fecha: new Date('2024-11-15'), peso: 82.0, estatura: 1.80, grasa: 22.0, observaciones: 'Inicio plan de entrenamiento' },
      { cliente: listaClientes[2], entrenador: entrenadorYoga, fecha: new Date('2024-11-20'), peso: 62.3, estatura: 1.65, grasa: 15.2, observaciones: 'Excelente flexibilidad' },
      { cliente: listaClientes[3], entrenador: entrenadorPilates, fecha: new Date('2024-12-05'), peso: 68.7, estatura: 1.70, grasa: 20.1, observaciones: 'Requiere fortalecer core' },
      { cliente: listaClientes[4], entrenador: entrenadorSpinning, fecha: new Date('2024-12-10'), peso: 79.4, estatura: 1.78, grasa: 19.5, observaciones: 'Buena resistencia cardiovascular' }
    ];

    for (const evalData of evaluacionesData) {
      if (!evalData.cliente || !evalData.entrenador) continue;
      await prisma.evaluacionBiometrica.create({
        data: {
          idCliente: evalData.cliente.id,
          idEntrenador: evalData.entrenador.id,
          fechaEvaluacion: evalData.fecha,
          peso: evalData.peso,
          estatura: evalData.estatura,
          porcentajeGrasa: evalData.grasa,
          observaciones: evalData.observaciones
        }
      });
      console.log(`    Evaluación de ${evalData.cliente.nombre} por ${evalData.entrenador.especialidad || 'entrenador'}`);
    }

    // ==================== 13. PLANES DE SUSCRIPCIÓN ====================
    console.log('\n Creando PLANES DE SUSCRIPCIÓN...');
    
    const suscripcionesData = [
      { nombre: 'Básico Mensual', descripcion: 'Acceso de lunes a viernes en horario diurno', costo: 35.00, diasDuracion: 30 },
      { nombre: 'Premium Mensual', descripcion: 'Acceso 24/7 + clases grupales ilimitadas', costo: 55.00, diasDuracion: 30 },
      { nombre: 'Premium Trimestral', descripcion: '3 meses con 10% descuento', costo: 148.50, diasDuracion: 90 },
      { nombre: 'Anual', descripcion: 'Año completo con 2 meses gratis', costo: 350.00, diasDuracion: 365 },
      { nombre: 'Estudiante', descripcion: 'Descuento para estudiantes con carnet', costo: 25.00, diasDuracion: 30 },
      { nombre: 'Plan Día', descripcion: 'Acceso por un día', costo: 10.00, diasDuracion: 1 }
    ];

    const suscripciones = {};
    for (const suscData of suscripcionesData) {
      let suscripcion = await prisma.suscripcion.findFirst({ where: { nombre: suscData.nombre } });
      if (!suscripcion) {
        suscripcion = await prisma.suscripcion.create({ data: suscData });
        console.log(`    Plan "${suscData.nombre}" creado`);
      }
      suscripciones[suscData.nombre] = suscripcion;
    }

    // ==================== 14. MEMBRESÍAS ====================
    console.log('\n Creando MEMBRESÍAS...');
    
    const membresiasData = [
      { cliente: listaClientes[0], plan: 'Premium Mensual', fechaInicio: new Date('2024-11-01'), estado: 'ACTIVA' },
      { cliente: listaClientes[1], plan: 'Básico Mensual', fechaInicio: new Date('2024-11-15'), estado: 'ACTIVA' },
      { cliente: listaClientes[2], plan: 'Premium Trimestral', fechaInicio: new Date('2024-10-01'), estado: 'POR_VENCER' },
      { cliente: listaClientes[3], plan: 'Anual', fechaInicio: new Date('2024-01-15'), estado: 'VENCIDA' },
      { cliente: listaClientes[4], plan: 'Estudiante', fechaInicio: new Date('2024-12-01'), estado: 'ACTIVA' },
      { cliente: listaClientes[5], plan: 'Premium Mensual', fechaInicio: new Date('2024-11-20'), estado: 'ACTIVA' },
      { cliente: listaClientes[6], plan: 'Básico Mensual', fechaInicio: new Date('2024-12-01'), estado: 'ACTIVA' },
      { cliente: listaClientes[7], plan: 'Premium Mensual', fechaInicio: new Date('2024-12-10'), estado: 'ACTIVA' }
    ];

    const membresias = [];
    for (const memData of membresiasData) {
      if (!memData.cliente) continue;
      const plan = suscripciones[memData.plan];
      if (!plan) continue;
      
      const fechaInicio = new Date(memData.fechaInicio);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + plan.diasDuracion);
      
      const membresia = await prisma.membresia.create({
        data: {
          idCliente: memData.cliente.id,
          idSuscripcion: plan.id,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          estado: memData.estado
        }
      });
      membresias.push(membresia);
      console.log(`    Membresía ${plan.nombre} para ${memData.cliente.nombre} (${memData.estado})`);
    }

    // ==================== 15. PAGOS ====================
    console.log('\n Creando PAGOS...');
    
    const pagosData = [
      { membresiaIndex: 0, monto: 55.00, metodo: 'TRANSFERENCIA', fecha: new Date('2024-11-01') },
      { membresiaIndex: 1, monto: 35.00, metodo: 'EFECTIVO', fecha: new Date('2024-11-15') },
      { membresiaIndex: 2, monto: 148.50, metodo: 'TARJETA_CREDITO', fecha: new Date('2024-10-01') },
      { membresiaIndex: 3, monto: 350.00, metodo: 'TARJETA_DEBITO', fecha: new Date('2024-01-15') },
      { membresiaIndex: 4, monto: 25.00, metodo: 'EFECTIVO', fecha: new Date('2024-12-01') },
      { membresiaIndex: 5, monto: 55.00, metodo: 'TRANSFERENCIA', fecha: new Date('2024-11-20') },
      { membresiaIndex: 6, monto: 35.00, metodo: 'EFECTIVO', fecha: new Date('2024-12-01') },
      { membresiaIndex: 7, monto: 55.00, metodo: 'TARJETA_CREDITO', fecha: new Date('2024-12-10') }
    ];

    for (const pagoData of pagosData) {
      const membresia = membresias[pagoData.membresiaIndex];
      if (!membresia) continue;
      
      await prisma.pago.create({
        data: {
          idMembresia: membresia.id,
          monto: pagoData.monto,
          fechaPago: pagoData.fecha,
          metodoPago: pagoData.metodo
        }
      });
      console.log(`    Pago de $${pagoData.monto} registrado`);
    }

    // ==================== 16. PRODUCTOS ====================
    console.log('\n Creando PRODUCTOS...');
    
    const productosData = [
      { nombre: 'Proteína Whey (2lb)', descripcion: 'Proteína de suero de leche', precio: 45.00, stock: 50 },
      { nombre: 'Creatina (300g)', descripcion: 'Suplemento para rendimiento', precio: 30.00, stock: 30 },
      { nombre: 'Shaker', descripcion: 'Vaso mezclador de proteína', precio: 8.00, stock: 100 },
      { nombre: 'Guantes de entrenamiento', descripcion: 'Guantes con protección de palma', precio: 20.00, stock: 25 },
      { nombre: 'Venda de muñeca', descripcion: 'Soporte para muñeca', precio: 12.00, stock: 40 },
      { nombre: 'Botella de agua', descripcion: 'Botella térmica 1L', precio: 15.00, stock: 60 },
      { nombre: 'Toalla deportiva', descripcion: 'Toalla microfibra', precio: 10.00, stock: 80 },
      { nombre: 'Camiseta SmartGym', descripcion: 'Camiseta oficial del gimnasio', precio: 25.00, stock: 45 }
    ];

    const productos = {};
    for (const prodData of productosData) {
      let producto = await prisma.producto.findFirst({ where: { nombre: prodData.nombre } });
      if (!producto) {
        producto = await prisma.producto.create({ data: prodData });
        console.log(`    Producto "${prodData.nombre}" creado`);
      }
      productos[prodData.nombre] = producto;
    }

    // ==================== 17. COMPRAS ====================
    console.log('\n Creando COMPRAS...');
    
    const comprasData = [
      { cliente: listaClientes[0], fecha: new Date('2024-12-05'), monto: 53.00 },
      { cliente: listaClientes[1], fecha: new Date('2024-12-10'), monto: 30.00 },
      { cliente: listaClientes[2], fecha: new Date('2024-12-12'), monto: 20.00 },
      { cliente: listaClientes[4], fecha: new Date('2024-12-08'), monto: 55.00 }
    ];

    const compras = [];
    for (const compData of comprasData) {
      if (!compData.cliente) continue;
      const compra = await prisma.compra.create({
        data: {
          idCliente: compData.cliente.id,
          fecha: compData.fecha,
          monto: compData.monto
        }
      });
      compras.push(compra);
      console.log(`    Compra de $${compData.monto} por ${compData.cliente.nombre}`);
    }

    // ==================== 18. DETALLES DE COMPRA ====================
    console.log('\n Creando DETALLES DE COMPRA...');
    
    const detallesData = [
      { compraIndex: 0, producto: 'Proteína Whey (2lb)', cantidad: 1, precioUnitario: 45.00 },
      { compraIndex: 0, producto: 'Shaker', cantidad: 1, precioUnitario: 8.00 },
      { compraIndex: 1, producto: 'Creatina (300g)', cantidad: 1, precioUnitario: 30.00 },
      { compraIndex: 2, producto: 'Guantes de entrenamiento', cantidad: 1, precioUnitario: 20.00 },
      { compraIndex: 3, producto: 'Camiseta SmartGym', cantidad: 1, precioUnitario: 25.00 },
      { compraIndex: 3, producto: 'Botella de agua', cantidad: 2, precioUnitario: 15.00 }
    ];

    for (const detData of detallesData) {
      const compra = compras[detData.compraIndex];
      const producto = productos[detData.producto];
      if (!compra || !producto) continue;
      
      await prisma.detalleCompra.create({
        data: {
          idCompra: compra.id,
          idProducto: producto.id,
          cantidad: detData.cantidad,
          precioUnitario: detData.precioUnitario
        }
      });
      console.log(`    ${detData.cantidad}x ${detData.producto} añadido a compra`);
    }

    // ==================== RESUMEN FINAL ====================
    console.log('\n' + '=' .repeat(60));
    console.log(' SEEDING COMPLETADO CON ÉXITO');
    console.log('=' .repeat(60));
    console.log('\n RESUMEN DE DATOS CREADOS:');
    console.log(`   • Roles: ${Object.keys(roles).length}`);
    console.log(`   • Usuarios: ${Object.keys(usuarios).length}`);
    console.log(`   • Clientes: ${Object.keys(clientes).length}`);
    console.log(`   • Entrenadores: ${Object.keys(entrenadores).length}`);
    console.log(`   • Categorías de máquinas: ${Object.keys(categorias).length}`);
    console.log(`   • Máquinas: ${Object.keys(maquinas).length}`);
    console.log(`   • Tickets mantenimiento: ${ticketsData.length}`);
    console.log(`   • Disciplinas: ${Object.keys(disciplinas).length}`);
    console.log(`   • Sesiones: ${sesiones.length}`);
    console.log(`   • Reservas: ${reservasData.filter(r => !r.skip).length || reservasData.length}`);
    console.log(`   • Controles acceso: ${accesosData.length}`);
    console.log(`   • Evaluaciones: ${evaluacionesData.length}`);
    console.log(`   • Planes suscripción: ${Object.keys(suscripciones).length}`);
    console.log(`   • Membresías: ${membresias.length}`);
    console.log(`   • Pagos: ${pagosData.length}`);
    console.log(`   • Productos: ${Object.keys(productos).length}`);
    console.log(`   • Compras: ${compras.length}`);
    console.log(`   • Detalles compra: ${detallesData.length}`);

    console.log('\n🔑 CREDENCIALES DE PRUEBA:');
    console.log('   ADMIN:       admin@smartgym.com / admin123');
    console.log('   ADMIN2:      admin2@smartgym.com / admin123');
    console.log('   FINANZAS:    finanzas@smartgym.com / finanzas123');
    console.log('   CONTADOR:    contador@smartgym.com / contador123');
    console.log('   CLIENTE:     cliente@smartgym.com / cliente123');
    console.log('   ENTRENADOR:  entrenador@smartgym.com / entrenador123');
    console.log('   RECEPCIÓN:   recepcion@smartgym.com / recepcion123');
    console.log('   MANTENIMIENTO: mantenimiento@smartgym.com / mantenimiento123');

  } catch (error) {
    console.error(' Error en seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();