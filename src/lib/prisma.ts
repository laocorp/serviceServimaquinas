import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma_v4: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL is not defined in environment variables!");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma =
    globalForPrisma.prisma_v4 ??
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma_v4 = prisma;
    const models = Object.keys(prisma).filter(k => !k.startsWith("$"));
    console.log("Prisma Client Refresh. Available Models:", models);
    if (!models.includes("customerTool")) {
        console.warn("⚠️ WARNING: customerTool model NOT found in Prisma Client!");
    }
}
