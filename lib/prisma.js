import { PrismaClient } from '../app/generated/prisma';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

// If routes or pages enter data into or from the db, you need to import
// prisma into the page e.g. import { prisma } from '../lib/prisma';