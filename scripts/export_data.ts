import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
        console.log(`Exporting ${model}...`);
        // @ts-ignore
        const data = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].findMany();
        fs.writeFileSync(
            path.join(exportDir, `${model}.json`),
            JSON.stringify(data, null, 2)
        );
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
