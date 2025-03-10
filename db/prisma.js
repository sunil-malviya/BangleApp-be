// ESM version
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Optional: handle log events from Prisma
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
});

export default prisma;
