import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import OrderDetailClient from "./client-page";
import { auth } from "@/auth";

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const params = await props.params;

    const order = await prisma.workOrder.findUnique({
        where: { id: params.id },
        include: {
            customer: true,
            technician: { select: { id: true, name: true } },
            items: {
                include: {
                    inventoryItem: { select: { name: true, code: true } }
                }
            },
            report: {
                include: {
                    technician: { select: { name: true } }
                }
            }
        }
    });

    if (!order) notFound();

    const inventoryItems = await prisma.inventoryItem.findMany({
        select: { id: true, name: true, stock: true, price: true },
        orderBy: { name: 'asc' }
    });

    // Solo cargar técnicos (o admins que asuman rol tecnico)
    const technicians = await prisma.user.findMany({
        where: { role: { in: ["TECNICO", "ADMIN"] } },
        select: { id: true, name: true }
    });

    const settings = await prisma.systemSettings.findUnique({
        where: { id: "global" }
    });

    return (
        <OrderDetailClient
            order={order}
            inventoryItems={inventoryItems}
            technicians={technicians}
            currentUserId={session.user.id}
            role={session.user.role}
            settings={settings}
        />
    );
}
