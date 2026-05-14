const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Configurar el pool de conexiones de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Admin@localhost:5433/smartgym?schema=public',
});

// Adaptador para Prisma7 con PostgreSQL
const adapter = new PrismaPg(pool);

// Crear instancia de Prisma Client con el adaptador
const prisma = new PrismaClient({ adapter });

// Manejar desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

module.exports = prisma;