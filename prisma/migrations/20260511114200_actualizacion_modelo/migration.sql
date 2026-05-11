/*
  Warnings:

  - You are about to drop the `categorias_maquinas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `control_accesos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detalles_compras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disciplinas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entrenadores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluaciones_biometricas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maquinas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membresias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pagos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sesiones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suscripciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets_mantenimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "compras" DROP CONSTRAINT "compras_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "control_accesos" DROP CONSTRAINT "control_accesos_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "detalles_compras" DROP CONSTRAINT "detalles_compras_idCompra_fkey";

-- DropForeignKey
ALTER TABLE "detalles_compras" DROP CONSTRAINT "detalles_compras_idProducto_fkey";

-- DropForeignKey
ALTER TABLE "entrenadores" DROP CONSTRAINT "entrenadores_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "evaluaciones_biometricas" DROP CONSTRAINT "evaluaciones_biometricas_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "evaluaciones_biometricas" DROP CONSTRAINT "evaluaciones_biometricas_idEntrenador_fkey";

-- DropForeignKey
ALTER TABLE "maquinas" DROP CONSTRAINT "maquinas_idCategoria_fkey";

-- DropForeignKey
ALTER TABLE "membresias" DROP CONSTRAINT "membresias_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "membresias" DROP CONSTRAINT "membresias_idSuscripcion_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_idMembresia_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_idSesion_fkey";

-- DropForeignKey
ALTER TABLE "sesiones" DROP CONSTRAINT "sesiones_idDisciplina_fkey";

-- DropForeignKey
ALTER TABLE "sesiones" DROP CONSTRAINT "sesiones_idEntrenador_fkey";

-- DropForeignKey
ALTER TABLE "tickets_mantenimiento" DROP CONSTRAINT "tickets_mantenimiento_idMaquina_fkey";

-- DropForeignKey
ALTER TABLE "tickets_mantenimiento" DROP CONSTRAINT "tickets_mantenimiento_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_idRol_fkey";

-- DropTable
DROP TABLE "categorias_maquinas";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "compras";

-- DropTable
DROP TABLE "control_accesos";

-- DropTable
DROP TABLE "detalles_compras";

-- DropTable
DROP TABLE "disciplinas";

-- DropTable
DROP TABLE "entrenadores";

-- DropTable
DROP TABLE "evaluaciones_biometricas";

-- DropTable
DROP TABLE "maquinas";

-- DropTable
DROP TABLE "membresias";

-- DropTable
DROP TABLE "pagos";

-- DropTable
DROP TABLE "productos";

-- DropTable
DROP TABLE "reservas";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "sesiones";

-- DropTable
DROP TABLE "suscripciones";

-- DropTable
DROP TABLE "tickets_mantenimiento";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "idRol" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrenador" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "especialidad" TEXT NOT NULL,

    CONSTRAINT "Entrenador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaMaquina" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "CategoriaMaquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maquina" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMantenimiento" (
    "id" SERIAL NOT NULL,
    "idMaquina" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaFalla" TIMESTAMP(3) NOT NULL,
    "descripcionFalla" TEXT NOT NULL,
    "fechaResolucion" TIMESTAMP(3),
    "costo" DOUBLE PRECISION,

    CONSTRAINT "TicketMantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" SERIAL NOT NULL,
    "idDisciplina" INTEGER NOT NULL,
    "idEntrenador" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "limiteDeCupos" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idSesion" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlAcceso" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "fechaHoraEntrada" TIMESTAMP(3) NOT NULL,
    "estadoAcceso" TEXT NOT NULL,
    "motivoRechazo" TEXT,

    CONSTRAINT "ControlAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionBiometrica" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idEntrenador" INTEGER NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "estatura" DOUBLE PRECISION NOT NULL,
    "porcentajeGrasa" DOUBLE PRECISION,
    "observaciones" TEXT,

    CONSTRAINT "EvaluacionBiometrica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo" DOUBLE PRECISION NOT NULL,
    "diasDuracion" INTEGER NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membresia" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idSuscripcion" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Membresia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "idMembresia" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "metodoPago" TEXT NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetallesCompra" (
    "id" SERIAL NOT NULL,
    "idCompra" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetallesCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Maquina_codigo_key" ON "Maquina"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_idCliente_idSesion_key" ON "Reserva"("idCliente", "idSesion");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrenador" ADD CONSTRAINT "Entrenador_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maquina" ADD CONSTRAINT "Maquina_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "CategoriaMaquina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMantenimiento" ADD CONSTRAINT "TicketMantenimiento_idMaquina_fkey" FOREIGN KEY ("idMaquina") REFERENCES "Maquina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMantenimiento" ADD CONSTRAINT "TicketMantenimiento_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_idDisciplina_fkey" FOREIGN KEY ("idDisciplina") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_idEntrenador_fkey" FOREIGN KEY ("idEntrenador") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_idSesion_fkey" FOREIGN KEY ("idSesion") REFERENCES "Sesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlAcceso" ADD CONSTRAINT "ControlAcceso_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionBiometrica" ADD CONSTRAINT "EvaluacionBiometrica_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionBiometrica" ADD CONSTRAINT "EvaluacionBiometrica_idEntrenador_fkey" FOREIGN KEY ("idEntrenador") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_idSuscripcion_fkey" FOREIGN KEY ("idSuscripcion") REFERENCES "Suscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_idMembresia_fkey" FOREIGN KEY ("idMembresia") REFERENCES "Membresia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallesCompra" ADD CONSTRAINT "DetallesCompra_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallesCompra" ADD CONSTRAINT "DetallesCompra_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
