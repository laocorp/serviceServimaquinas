const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Available Models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
prisma.$disconnect();
