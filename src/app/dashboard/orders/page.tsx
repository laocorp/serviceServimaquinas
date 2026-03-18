import { prisma } from "@/lib/prisma";
import OrdersBoard from "./KanbanBoard";
import { auth } from "@/auth";

export default async function OrdersPage() {
    const session = await auth();
    const role = session?.user?.role || "TECNICO";

    const orders = await prisma.workOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: { name: true, isVIP: true },
            },
            technician: { select: { name: true } },
        },
    });

    // Serializar Decimal a number para evitar error de Client Component
    const serializedOrders = orders.map(order => ({
        ...order,
        laborCost: order.laborCost ? Number(order.laborCost) : 0,
        totalCost: order.totalCost ? Number(order.totalCost) : 0,
    }));

    return <OrdersBoard initialOrders={serializedOrders as any} role={role} />;
}
