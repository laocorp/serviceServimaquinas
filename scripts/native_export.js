const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const tables = [
        'User', 'Category', 'InventoryItem', 'Customer',
        'WorkOrder', 'WorkOrderItem', 'WorkReport',
        'SystemSettings', 'StoreCategory', 'Product'
    ];

    const data = {};

    try {
        await client.connect();
        console.log('Connected to source DB.');

        for (const table of tables) {
            console.log(`Exporting ${table}...`);
            // PostgreSQL is sensitive to case if quoted, but usually Prisma names maps to "TableName" or "table_name"
            // In this case Prisma seems to use camelCase or same name.
            const res = await client.query(`SELECT * FROM "${table}"`);
            data[table] = res.rows;
            console.log(`  Read ${res.rowCount} rows.`);
        }

        const exportDir = path.join(process.cwd(), 'tmp_migration_data');
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

        fs.writeFileSync(
            path.join(exportDir, 'precision_dump.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('Export complete.');

    } catch (err) {
        console.error('Export failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

exportData();
