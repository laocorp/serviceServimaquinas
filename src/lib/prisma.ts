import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_plyz6HAXNE7r@ep-nameless-smoke-ajeddw5q-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma =
    globalForPrisma.prisma_v2 ??
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
