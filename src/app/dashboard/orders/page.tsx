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
                select: { firstName: true, lastName: true, isVIP: true },
            },
            technician: { select: { name: true } },
        },
    });

    return <OrdersBoard initialOrders={orders as any} role={role} />;
}
