const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    const prisma = new PrismaClient();
    const exportDir = path.join(process.cwd(), 'tmp_migration_data');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const models = [
        'User', 'Category', 'InventoryItem', 'Customer',
        'WorkOrder', 'WorkOrderItem', 'WorkReport',
        'SystemSettings', 'StoreCategory', 'Product'
    ];

    const data = {};
    for (const model of models) {
        const accessor = model.charAt(0).toLowerCase() + model.slice(1);
        console.log(`Fetching ${model}...`);
        try {
            data[model] = await prisma[accessor].findMany();
            console.log(`  Found ${data[model].length} records.`);
        } catch (e) {
            console.error(`  Error fetching ${model}:`, e.message);
        }
    }

    const exportPath = path.join(exportDir, 'precision_dump.json');
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    console.log(`Dump saved to ${exportPath}`);
    await prisma.$disconnect();
}

run();
