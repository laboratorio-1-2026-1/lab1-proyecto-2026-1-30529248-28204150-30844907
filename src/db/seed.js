const prisma = require('./prisma');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

async function seed() {
  console.log('🌱 Iniciando seeding...');

  try {
    await prisma.$connect();
    console.log(' Conectado a PostgreSQL');

    // ==================== ROLES ====================
    const rolesData = [
      { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
      { nombre: 'FINANZAS', descripcion: 'Módulo de finanzas' },
      { nombre: 'ENTRENADOR', descripcion: 'Entrenador del gimnasio' },
      { nombre: 'CLIENTE', descripcion: 'Cliente del gimnasio' },
      { nombre: 'RECEPCIONISTA', descripcion: 'Atención al cliente' },
      { nombre: 'MANTENIMIENTO', descripcion: 'Mantenimiento de máquinas' }
    ];

    const roles = [];
    for (const rolData of rolesData) {
      let rol = await prisma.rol.findFirst({
        where: { nombre: rolData.nombre }
      });

      if (!rol) {
        rol = await prisma.rol.create({ data: rolData });
        console.log(` Rol "${rolData.nombre}" creado`);
      } else {
        console.log(` Rol "${rolData.nombre}" ya existe`);
      }
      roles.push(rol);
    }

    // ==================== USUARIO ADMIN ====================
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminRol = roles.find(r => r.nombre === 'ADMIN');
    
    let adminUsuario = await prisma.usuario.findFirst({
      where: { email: 'admin@smartgym.com' }
    });

    if (!adminUsuario) {
      adminUsuario = await prisma.usuario.create({
        data: {
          email: 'admin@smartgym.com',
          password: adminPassword,
          idRol: adminRol.id,        
          estado: 'ACTIVO',
          descripcion: 'Usuario administrador'  
        }
      });
      console.log(' Usuario ADMIN creado');
    } else {
      console.log(' Usuario ADMIN ya existe');
    }

    // ==================== USUARIO FINANZAS ====================
    const finanzasPassword = await bcrypt.hash('finanzas123', 10);
    const finanzasRol = roles.find(r => r.nombre === 'FINANZAS');
    
    let finanzasUsuario = await prisma.usuario.findFirst({
      where: { email: 'finanzas@smartgym.com' }
    });

    if (!finanzasUsuario) {
      finanzasUsuario = await prisma.usuario.create({
        data: {
          email: 'finanzas@smartgym.com',
          password: finanzasPassword,
          idRol: finanzasRol.id,        
          estado: 'ACTIVO',
          descripcion: 'Usuario de finanzas'
        }
      });
      console.log(' Usuario FINANZAS creado');
    } else {
      console.log(' Usuario FINANZAS ya existe');
    }

    // ==================== USUARIO CLIENTE ====================
    const clientePassword = await bcrypt.hash('cliente123', 10);
    const clienteRol = roles.find(r => r.nombre === 'CLIENTE');
    
    let clienteUsuario = await prisma.usuario.findFirst({
      where: { email: 'cliente@smartgym.com' }
    });

    if (!clienteUsuario) {
      clienteUsuario = await prisma.usuario.create({
        data: {
          email: 'cliente@smartgym.com',
          password: clientePassword,
          idRol: clienteRol.id,       
          estado: 'ACTIVO',
          descripcion: 'Cliente del gimnasio'
        }
      });

      await prisma.cliente.create({
        data: {
          idUsuario: clienteUsuario.id,
          cedula: 'V-12345678',
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '04129876543'
        }
      });
      console.log(' Usuario CLIENTE creado');
    } else {
      console.log(' Usuario CLIENTE ya existe');
    }

    // ==================== USUARIO ENTRENADOR ====================
    const entrenadorPassword = await bcrypt.hash('entrenador123', 10);
    const entrenadorRol = roles.find(r => r.nombre === 'ENTRENADOR');
    
    let entrenadorUsuario = await prisma.usuario.findFirst({
      where: { email: 'entrenador@smartgym.com' }
    });

    if (!entrenadorUsuario) {
      entrenadorUsuario = await prisma.usuario.create({
        data: {
          email: 'entrenador@smartgym.com',
          password: entrenadorPassword,
          idRol: entrenadorRol.id,        
          estado: 'ACTIVO',
          descripcion: 'Entrenador del gimnasio'
        }
      });

      await prisma.entrenador.create({
        data: {
          idUsuario: entrenadorUsuario.id,
          especialidad: 'Yoga y Pilates'
        }
      });
      console.log(' Usuario ENTRENADOR creado');
    } else {
      console.log(' Usuario ENTRENADOR ya existe');
    }

    // ==================== USUARIO RECEPCIONISTA ====================
    const recepcionistaPassword = await bcrypt.hash('recepcion123', 10);
    const recepcionistaRol = roles.find(r => r.nombre === 'RECEPCIONISTA');
    
    let recepcionistaUsuario = await prisma.usuario.findFirst({
      where: { email: 'recepcion@smartgym.com' }
    });

    if (!recepcionistaUsuario) {
      recepcionistaUsuario = await prisma.usuario.create({
        data: {
          email: 'recepcion@smartgym.com',
          password: recepcionistaPassword,
          idRol: recepcionistaRol.id,        
          estado: 'ACTIVO',
          descripcion: 'Recepcionista del gimnasio'
        }
      });
      console.log(' Usuario RECEPCIONISTA creado');
    } else {
      console.log('c Usuario RECEPCIONISTA ya existe');
    }

    console.log('\n Seeding completado con éxito');
    console.log('\n Credenciales de prueba:');
    console.log('   ADMIN:       admin@smartgym.com / admin123');
    console.log('   FINANZAS:    finanzas@smartgym.com / finanzas123');
    console.log('   CLIENTE:     cliente@smartgym.com / cliente123');
    console.log('   ENTRENADOR:  entrenador@smartgym.com / entrenador123');
    console.log('   RECEPCION:   recepcion@smartgym.com / recepcion123');

  } catch (error) {
    console.error(' Error en seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();