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
                    inventoryItem: { select: { name: true, sku: true } }
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

    const [inventoryItems, settings] = await Promise.all([
        prisma.inventoryItem.findMany({
            select: { id: true, name: true, quantity: true, unitPrice: true },
            orderBy: { name: 'asc' }
        }),
        prisma.systemSettings.findUnique({
            where: { id: "global" }
        })
    ]);

    // Serialización para evitar errores de Decimal en Componentes de Cliente
    const serializedOrder = {
        ...order,
        laborCost: Number(order.laborCost),
        totalCost: Number(order.totalCost),
        items: order.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice)
        }))
    };

    const serializedInventory = inventoryItems.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice)
    }));

    const serializedSettings = settings ? {
        ...settings,
        taxRate: Number(settings.taxRate)
    } : null;

    // Solo cargar técnicos (o admins que asuman rol tecnico)
    const technicians = await prisma.user.findMany({
        where: { role: { in: ["TECNICO", "ADMIN"] } },
        select: { id: true, name: true }
    });

    return (
        <OrderDetailClient
            order={serializedOrder as any}
            inventoryItems={serializedInventory as any}
            technicians={technicians}
            currentUserId={session.user.id}
            role={session.user.role}
            settings={serializedSettings as any}
        />
    );
}
