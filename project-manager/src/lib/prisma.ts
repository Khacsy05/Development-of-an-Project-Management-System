import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const initPrisma = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  const url = new URL(dbUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port) : 3306,
    user: decodeURIComponent(url.username) || 'root',
    password: decodeURIComponent(url.password) || undefined,
    database: decodeURIComponent(url.pathname.substring(1)),
  });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? initPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
