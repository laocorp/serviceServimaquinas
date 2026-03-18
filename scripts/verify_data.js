const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                tools: {
                    include: {
                        maintenanceLogs: true
                    }
                }
            }
        });
        console.log('Customers found:', customers.length);
        customers.forEach(c => {
            console.log(`- Customer: ${c.name}, Tools: ${c.tools.length}`);
            c.tools.forEach(t => {
                console.log(`  - Tool: ${t.name}, Logs: ${t.maintenanceLogs?.length || 0}`);
            });
        });
    } catch (e) {
        console.error('ERROR during query:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
