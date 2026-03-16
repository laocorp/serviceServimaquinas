const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkAppDb() {
    console.log('App DATABASE_URL:', process.env.DATABASE_URL.split('@')[1]); // Log host only
    const prisma = new PrismaClient();

    const models = [
        'User', 'Customer', 'WorkOrder', 'InventoryItem'
    ];

    console.log('---DATA_COUNTS_START---');
    for (const model of models) {
        try {
            const count = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count();
            console.log(`${model}: ${count}`);
        } catch (e) {
            console.log(`${model}: ERROR (${e.message})`);
        }
    }
    console.log('---DATA_COUNTS_END---');

    await prisma.$disconnect();
}

checkAppDb();
