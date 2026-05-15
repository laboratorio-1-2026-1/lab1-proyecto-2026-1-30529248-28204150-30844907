const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { ESTADOS_GENERALES, TOKENS, CODIGOS_ERROR } = require('../config/constantes');
const { use } = require('react');

class AuthService {
  constructor() {
    this.user = null;
  }
  async login(email, password) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    this.user = usuario.id;


    if (!usuario) {
      throw { status: 401, code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS, message: 'Credenciales inválidas' };
    }

    if (usuario.estado !== ESTADOS_GENERALES.ACTIVO) {
      throw { status: 401, code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS, message: 'Usuario inactivo' };
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      throw { status: 401, code: CODIGOS_ERROR.CREDENCIALES_INVALIDAS, message: 'Credenciales inválidas' };
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        idRol: usuario.idRol,
        rolNombre: usuario.rol.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKENS.JWT_EXPIRES_IN }
    );

    const { password: _, ...usuarioSinPassword } = usuario;
    return { token, usuario: usuarioSinPassword };
  }

  async register(userData) {
    console.log(' Iniciando registro de usuario:', userData.email);
    
    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      cedula,      
      telefono,    
      rolNombre,
      descripcion,
      especialidad
    } = userData;

    if (!email) throw { status: 400, message: 'Email es requerido' };
    if (!password) throw { status: 400, message: 'Password es requerido' };
    if (!rolNombre) throw { status: 400, message: 'rolNombre es requerido' };

    const existingUser = await prisma.usuario.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      throw { 
        status: 409, 
        message: 'El email ya está registrado' 
      };
    }

    const rol = await prisma.rol.findFirst({
      where: { nombre: rolNombre.toUpperCase() }
    });

    if (!rol) {
      throw { 
        status: 404, 
        message: `El rol "${rolNombre}" no existe. Roles disponibles: ADMIN, FINANZAS, ENTRENADOR, CLIENTE` 
      };
    }

    console.log(' Rol encontrado:', rol.nombre);

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        idRol: rol.id,
        descripcion: descripcion || `Usuario con rol ${rol.nombre}`,
        estado: 'ACTIVO'
      },
      include: { rol: true }
    });

    console.log(' Usuario creado, ID:', nuevoUsuario.id);

    if (rol.nombre === 'CLIENTE') {
      if (!cedula) throw { status: 400, message: 'La cédula es requerida para clientes' };
      if (!nombre) throw { status: 400, message: 'El nombre es requerido para clientes' };
      if (!apellido) throw { status: 400, message: 'El apellido es requerido para clientes' };
      
      const existingCedula = await prisma.cliente.findUnique({
        where: { cedula }
      });
      
      if (existingCedula) {
        throw { 
          status: 409, 
          message: 'La cédula ya está registrada' 
        };
      }

      await prisma.cliente.create({
        data: {
          idUsuario: nuevoUsuario.id,
          cedula: cedula,
          nombre: nombre,
          apellido: apellido,
          telefono: telefono || null
        }
      });
      console.log(' Registro de CLIENTE creado');
    }

    else if (rol.nombre === 'ENTRENADOR') {
      if (!especialidad) throw { status: 400, message: 'La especialidad es requerida para entrenadores' };
      if (rol.nombre === 'ENTRENADOR') {
      const especialidadFinal = especialidad && typeof especialidad === 'string' 
        ? especialidad 
        : null;
        
      await prisma.entrenador.create({
        data: {
          idUsuario: nuevoUsuario.id,
          especialidad: especialidad || null
        }
      });
      console.log(' Registro de ENTRENADOR creado');
      }
    }
    
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    
    console.log(' Registro completado exitosamente');
    return usuarioSinPassword;
  }

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take: limit,
        include: { 
          rol: true,
          cliente: true,
          entrenador: true
        },
        orderBy: { id: 'desc' }
      }),
      prisma.usuario.count()
    ]);

    const usuariosFormateados = usuarios.map(({ password, ...rest }) => ({
      ...rest,
      rol: rest.rol.nombre,
      tipoUsuario: rest.cliente ? 'CLIENTE' : (rest.entrenador ? 'ENTRENADOR' : 'USUARIO_SIN_ESPECIFICACION'),
      datosEspecificos: rest.cliente || rest.entrenador || null
    }));

    return {
      data: usuariosFormateados,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getUserById(userId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) },
      include: { 
        rol: true,
        cliente: true,
        entrenador: true
      }
    });

    if (!usuario) {
      throw { status: 404, code: CODIGOS_ERROR.NO_ENCONTRADO, message: 'Usuario no encontrado' };
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    
    return {
      ...usuarioSinPassword,
      rol: usuarioSinPassword.rol.nombre,
      tipoUsuario: usuario.cliente ? 'CLIENTE' : (usuario.entrenador ? 'ENTRENADOR' : 'USUARIO_SIN_ESPECIFICACION'),
      datosEspecificos: usuario.cliente || usuario.entrenador || null
    };
  }

  async updateUser(userId, updateData) {
    console.log(' Actualizando usuario ID:', userId);
    console.log('   Datos recibidos:', updateData);
    
    const { 
      email, 
      nombre, 
      apellido, 
      cedula, 
      telefono, 
      rolNombre, 
      estado,       
      descripcion, 
      especialidad   
    } = updateData;

    const existingUser = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) },
      include: { rol: true, cliente: true, entrenador: true }
    });

    if (!existingUser) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    const usuarioUpdateFields = {};
    
    if (email !== undefined) usuarioUpdateFields.email = email;
    if (descripcion !== undefined) usuarioUpdateFields.descripcion = descripcion;
    if (estado !== undefined) usuarioUpdateFields.estado = estado;
    
    if (rolNombre) {
      const rol = await prisma.rol.findFirst({
        where: { nombre: rolNombre.toUpperCase() }
      });
      if (!rol) {
        throw { status: 404, message: `El rol "${rolNombre}" no existe` };
      }
      usuarioUpdateFields.idRol = rol.id;
    }

    let usuarioActualizado = existingUser;
    if (Object.keys(usuarioUpdateFields).length > 0) {
      usuarioActualizado = await prisma.usuario.update({
        where: { id: parseInt(userId) },
        data: usuarioUpdateFields,
        include: { rol: true, cliente: true, entrenador: true }
      });
      console.log(' Usuario actualizado');
    }

    const tieneCliente = usuarioActualizado.cliente && usuarioActualizado.cliente.length > 0;
    
    if (tieneCliente) {
      const clienteUpdateFields = {};
      
      if (nombre !== undefined) clienteUpdateFields.nombre = nombre;
      if (apellido !== undefined) clienteUpdateFields.apellido = apellido;
      if (cedula !== undefined) clienteUpdateFields.cedula = cedula;
      if (telefono !== undefined) clienteUpdateFields.telefono = telefono;
      
      
      if (Object.keys(clienteUpdateFields).length > 0) {
        await prisma.cliente.update({
          where: { id: usuarioActualizado.cliente[0].id },
          data: clienteUpdateFields
        });
        console.log(' Datos de CLIENTE actualizados');
      }
    }

    const tieneEntrenador = usuarioActualizado.entrenador && usuarioActualizado.entrenador.length > 0;
    
    if (tieneEntrenador && especialidad !== undefined) {
      await prisma.entrenador.update({
        where: { id: usuarioActualizado.entrenador[0].id },
        data: { especialidad: especialidad }
      });
      console.log(' Datos de ENTRENADOR actualizados');
    }

    const usuarioFinal = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) },
      include: { rol: true, cliente: true, entrenador: true }
    });

    const { password: _, ...usuarioSinPassword } = usuarioFinal;
    
    console.log(' Actualización completada');
    
    return {
      ...usuarioSinPassword,
      rol: usuarioSinPassword.rol.nombre
    };
  }

  async deleteUser(userId) {
    const existingUser = await prisma.usuario.findUnique({ where: { id: parseInt(userId) } });
    if (!existingUser) {
      throw { status: 404, code: CODIGOS_ERROR.NO_ENCONTRADO, message: 'Usuario no encontrado' };
    }

    const usuarioEliminado = await prisma.usuario.update({
      where: { id: parseInt(userId) },
      data: { estado: ESTADOS_GENERALES.INACTIVO },
      include: { rol: true }
    });

    const { password: _, ...usuarioSinPassword } = usuarioEliminado;
    return usuarioSinPassword;
  }

  async getProfile(userId) {
    console.log(' getProfile service - userId:', userId);

    if (!userId) {
      throw { status: 400, message: 'ID de usuario inválido' };
    } 
    if (userId == null || userId === undefined || isNaN(parseInt(userId))) {
      userId = this.user;
    }
    
    const id = parseInt(userId);
    if (isNaN(id)) {
      throw {
        status: 400,
        code: 'ID_INVALIDO',
        message: 'ID de usuario inválido'
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: id },
      include: { 
        rol: true,
        cliente: true,
        entrenador: true
      }
    });

    if (!usuario) {
      throw {
        status: 404,
        code: CODIGOS_ERROR.NO_ENCONTRADO,
        message: 'Usuario no encontrado'
      };
    }

    console.log(' Usuario encontrado en getProfile');

    const { password: _, ...usuarioSinPassword } = usuario;
    const tieneCliente = usuario.cliente && usuario.cliente.length > 0;
    const tieneEntrenador = usuario.entrenador && usuario.entrenador.length > 0;

    return {
      ...usuarioSinPassword,
      rol: usuarioSinPassword.rol?.nombre || 'Sin rol',
      tipoUsuario: tieneCliente ? 'CLIENTE' : (tieneEntrenador ? 'ENTRENADOR' : 'USUARIO_SIN_ESPECIFICACION')
    };
  }
}

module.exports = new AuthService();