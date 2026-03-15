import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json([], { status: 401 });
        }

        const notifications = [];

        // 1. Órdenes nuevas (recibidas en las últimas 24h)
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentOrders = await prisma.workOrder.findMany({
            where: { createdAt: { gte: since24h } },
            include: { customer: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        for (const order of recentOrders) {
            const mins = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
            const time = mins < 60 ? `Hace ${mins} min` : `Hace ${Math.floor(mins / 60)}h`;
            notifications.push({
                id: `order-${order.id}`,
                title: "Nueva orden registrada",
                body: `${order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Cliente"} — ${order.trackingCode}`,
                time,
                read: false,
                type: "order",
            });
        }

        // 2. Alertas de inventario (stock <= minStock) — comparación en JS
        const allInventory = await prisma.inventoryItem.findMany({
            select: { id: true, name: true, stock: true, minStock: true },
        });
        const lowStock = allInventory.filter(i => i.stock <= i.minStock);

        for (const item of lowStock.slice(0, 3)) {
            notifications.push({
                id: `inv-${item.id}`,
                title: "Stock bajo — Inventario",
                body: `${item.name} tiene solo ${item.stock} unidades (mínimo ${item.minStock})`,
                time: "Alerta activa",
                read: false,
                type: "inventory",
            });
        }

        // 3. Si no hay nada, agregar mensaje de bienvenida
        if (notifications.length === 0) {
            notifications.push({
                id: "welcome",
                title: "Todo en orden ✓",
                body: "No hay alertas nuevas. El sistema está operativo.",
                time: "ahora",
                read: true,
                type: "info",
            });
        }

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json([
            {
                id: "fallback",
                title: "Sistema operativo",
                body: "No se pudieron cargar las notificaciones.",
                time: "ahora",
                read: true,
                type: "info",
            }
        ]);
    }
}
