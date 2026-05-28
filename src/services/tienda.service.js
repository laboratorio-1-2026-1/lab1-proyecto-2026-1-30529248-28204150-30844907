const prisma = require('../db/prisma');
const { CODIGOS_ERROR } = require('../config/constantes');

class TiendaService {
  
  // ==================== PRODUCTOS ====================
  
  async getAllProductos(filtros = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filtros.nombre) where.nombre = { contains: filtros.nombre, mode: 'insensitive' };
    if (filtros.stockMinimo) where.stock = { gte: parseInt(filtros.stockMinimo) };
    if (filtros.conStock === 'true') where.stock = { gt: 0 };
    if (filtros.sinStock === 'true') where.stock = { equals: 0 };
    
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        skip, take: limit, where, orderBy: { id: 'asc' }
      }),
      prisma.producto.count({ where })
    ]);
    
    return { data: productos, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getProductoById(id) {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: { detalles: true }
    });
    if (!producto) throw { status: 404, message: 'Producto no encontrado' };
    return producto;
  }
  
  async createProducto(data) {
    const { nombre, descripcion, precio, stock } = data;
    if (!nombre) throw { status: 400, message: 'El nombre es requerido' };
    if (!precio) throw { status: 400, message: 'El precio es requerido' };
    if (precio <= 0) throw { status: 400, message: 'El precio debe ser mayor a 0' };
    
    return await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : 0
      }
    });
  }
  
  async updateProducto(id, data) {
    const existing = await prisma.producto.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw { status: 404, message: 'Producto no encontrado' };
    
    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.precio !== undefined) updateData.precio = parseFloat(data.precio);
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    
    return await prisma.producto.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }
  
  async deleteProducto(id) {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: { detalles: true }
    });
    if (!producto) throw { status: 404, message: 'Producto no encontrado' };
    if (producto.detalles.length > 0) {
      throw { status: 409, message: `No se puede eliminar porque tiene ${producto.detalles.length} venta(s) asociada(s)` };
    }
    await prisma.producto.delete({ where: { id: parseInt(id) } });
    return { message: 'Producto eliminado exitosamente' };
  }
  
  async ajustarStock(id, cantidad, operacion) {
    const producto = await prisma.producto.findUnique({ where: { id: parseInt(id) } });
    if (!producto) throw { status: 404, message: 'Producto no encontrado' };
    
    let nuevoStock;
    if (operacion === 'sumar') {
      nuevoStock = producto.stock + parseInt(cantidad);
    } else if (operacion === 'restar') {
      nuevoStock = producto.stock - parseInt(cantidad);
      if (nuevoStock < 0) throw { status: 409, code: 'STOCK_INSUFICIENTE', message: `Stock insuficiente. Stock actual: ${producto.stock}` };
    } else {
      throw { status: 400, message: 'Operación inválida. Use "sumar" o "restar"' };
    }
    
    return await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { stock: nuevoStock }
    });
  }
  
  // ==================== VENTAS ====================
  
  async getAllVentas(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [ventas, total] = await Promise.all([
      prisma.compra.findMany({
        skip, take: limit,
        include: { cliente: { include: { usuario: true } }, detalles: { include: { producto: true } } },
        orderBy: { fecha: 'desc' }
      }),
      prisma.compra.count()
    ]);
    return { data: ventas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getVentasByCliente(clienteId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [ventas, total] = await Promise.all([
      prisma.compra.findMany({
        where: { idCliente: parseInt(clienteId) },
        skip, take: limit,
        include: { detalles: { include: { producto: true } } },
        orderBy: { fecha: 'desc' }
      }),
      prisma.compra.count({ where: { idCliente: parseInt(clienteId) } })
    ]);
    return { data: ventas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  
  async getVentaById(id) {
    const venta = await prisma.compra.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: { include: { usuario: true } }, detalles: { include: { producto: true } } }
    });
    if (!venta) throw { status: 404, message: 'Venta no encontrada' };
    return venta;
  }
  
  async crearVenta(data, usuarioId) {
    const { idCliente, items } = data;
    if (!idCliente) throw { status: 400, message: 'El cliente es requerido' };
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw { status: 400, message: 'Debe incluir al menos un producto' };
    }
    
    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(idCliente) } });
    if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
    
    let total = 0;
    const detallesValidados = [];
    
    for (const item of items) {
      const producto = await prisma.producto.findUnique({ where: { id: parseInt(item.idProducto) } });
      if (!producto) throw { status: 404, message: `Producto ID ${item.idProducto} no encontrado` };
      if (producto.stock < item.cantidad) {
        throw { status: 409, code: 'STOCK_INSUFICIENTE', message: `Stock insuficiente para "${producto.nombre}"` };
      }
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      detallesValidados.push({
        idProducto: producto.id,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal
      });
    }
    
    const nuevaVenta = await prisma.$transaction(async (tx) => {
      const venta = await tx.compra.create({
        data: { idCliente: parseInt(idCliente), fecha: new Date(), monto: total }
      });
      
      for (const detalle of detallesValidados) {
        await tx.detalleCompra.create({
          data: { idCompra: venta.id, idProducto: detalle.idProducto, cantidad: detalle.cantidad, precioUnitario: detalle.precioUnitario }
        });
        await tx.producto.update({ where: { id: detalle.idProducto }, data: { stock: { decrement: detalle.cantidad } } });
      }
      return venta;
    });
    
    return await this.getVentaById(nuevaVenta.id);
  }
  
  async cancelarVenta(ventaId) {
    const venta = await prisma.compra.findUnique({ where: { id: parseInt(ventaId) }, include: { detalles: true } });
    if (!venta) throw { status: 404, message: 'Venta no encontrada' };
    
    await prisma.$transaction(async (tx) => {
      for (const detalle of venta.detalles) {
        await tx.producto.update({ where: { id: detalle.idProducto }, data: { stock: { increment: detalle.cantidad } } });
      }
      await tx.detalleCompra.deleteMany({ where: { idCompra: parseInt(ventaId) } });
      await tx.compra.delete({ where: { id: parseInt(ventaId) } });
    });
    return { message: 'Venta cancelada y stock restaurado' };
  }
  
  // ==================== REPORTES ====================
  
  async getReporteVentas(fechaInicio, fechaFin) {
    const where = {};
    if (fechaInicio && fechaFin) {
      where.fecha = { gte: new Date(fechaInicio), lte: new Date(fechaFin) };
    }
    
    const ventas = await prisma.compra.findMany({
      where, include: { detalles: { include: { producto: true } }, cliente: { include: { usuario: true } } },
      orderBy: { fecha: 'desc' }
    });
    
    const totalVentas = ventas.reduce((sum, v) => sum + v.monto, 0);
    const productosVendidos = {};
    
    for (const venta of ventas) {
      for (const detalle of venta.detalles) {
        if (!productosVendidos[detalle.producto.nombre]) {
          productosVendidos[detalle.producto.nombre] = { producto: detalle.producto.nombre, cantidad: 0, total: 0 };
        }
        productosVendidos[detalle.producto.nombre].cantidad += detalle.cantidad;
        productosVendidos[detalle.producto.nombre].total += detalle.subtotal;
      }
    }
    
    return {
      resumen: { totalVentas, cantidadVentas: ventas.length, ticketPromedio: ventas.length > 0 ? totalVentas / ventas.length : 0 },
      productosMasVendidos: Object.values(productosVendidos).sort((a, b) => b.cantidad - a.cantidad),
      ventas
    };
  }
}

module.exports = new TiendaService();