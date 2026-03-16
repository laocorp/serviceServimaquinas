const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const exportDir = path.join(process.cwd(), 'tmp_migration_data');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const models = [
        'User',
        'Category',
        'InventoryItem',
        'Customer',
        'WorkOrder',
        'WorkOrderItem',
        'WorkReport',
        'SystemSettings',
        'StoreCategory',
        'Product'
    ];

    for (const model of models) {
        const plural = model.charAt(0).toLowerCase() + model.slice(1);
        console.log(`Exporting ${model}...`);
        try {
            const data = await prisma[plural].findMany();
            fs.writeFileSync(
                path.join(exportDir, `${model}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`  Success: ${data.length} records.`);
        } catch (err) {
            console.error(`  Error exporting ${model}:`, err.message);
        }
    }

    console.log('Export complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
