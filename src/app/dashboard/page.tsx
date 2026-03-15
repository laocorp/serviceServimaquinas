import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardActions from "./DashboardActions";

export default async function DashboardPage() {
    // 1. Órdenes Activas
    const activeOrdersCount = await prisma.workOrder.count({
        where: {
            status: { in: ["PENDIENTE", "EN_REVISION", "EN_REPARACION"] },
        },
    });

    // 2. Clientes VIP
    const vipCustomersCount = await prisma.customer.count({
        where: { isVIP: true },
    });

    // 3. Valor en repuestos consumidos
    const usedItems = await prisma.workOrderItem.findMany({
        select: { quantity: true, priceAtTime: true },
    });
    const estimatedRevenue = usedItems.reduce(
        (total: number, item: { quantity: number; priceAtTime: number }) =>
            total + item.quantity * item.priceAtTime,
        0
    );

    // 4. Alertas de Inventario (stock <= minStock)
    const allItems = await prisma.inventoryItem.findMany({
        select: { stock: true, minStock: true },
    });
    const inventoryAlertsCount = allItems.filter(
        (item: { stock: number; minStock: number }) => item.stock <= item.minStock
    ).length;

    // 5. Datos para exportar CSV (se pasan al client component)
    const ordersForExport = await prisma.workOrder.findMany({
        select: {
            trackingCode: true,
            reportedIssue: true,
            deviceBrand: true,
            deviceModel: true,
            status: true,
            createdAt: true,
            customer: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                        Cifras Generales
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Resumen del estado operativo en tiempo{" "}
                        <span className="text-blue-500 font-medium">real</span>.
                    </p>
                </div>

                {/* Botones de acción — client component para interactividad */}
                <DashboardActions orders={ordersForExport} />
            </div>

            {/* Grid de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: "Órdenes Activas",
                        value: activeOrdersCount.toString(),
                        trend: "En proceso ahora",
                        href: "/dashboard/orders",
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        ),
                        trendColor: "text-blue-600 dark:text-blue-400",
                    },
                    {
                        title: "Clientes VIP",
                        value: vipCustomersCount.toString(),
                        trend: "Marcas Exclusivas",
                        href: "/dashboard/customers",
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        ),
                        trendColor: "text-amber-600 dark:text-amber-400",
                    },
                    {
                        title: "Valor en Repuestos",
                        value: `$${estimatedRevenue.toLocaleString("es-CO")}`,
                        trend: "Total invertido",
                        href: "/dashboard/inventory",
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="2" x2="12" y2="22" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        ),
                        trendColor: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                        title: "Alertas de Inventario",
                        value: inventoryAlertsCount.toString(),
                        trend: inventoryAlertsCount > 0 ? "Requieren atención" : "Todo en stock",
                        href: "/dashboard/inventory",
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        ),
                        trendColor: inventoryAlertsCount > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400",
                    },
                ].map((stat, i) => (
                    <Link key={i} href={stat.href}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-2xl group-hover:bg-slate-100 dark:group-hover:bg-zinc-700 transition-colors">
                                {stat.icon}
                            </div>
                        </div>
                        <p className={`text-xs font-bold mt-4 flex items-center gap-1.5 ${stat.trendColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current ${inventoryAlertsCount > 0 && i === 3 ? "animate-pulse" : ""}`} />
                            {stat.trend}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
