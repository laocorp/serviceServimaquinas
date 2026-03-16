import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DashboardActions from "./DashboardActions";
import StatsSmall from "@/components/dashboard/StatsSmall";
import CommandCenter from "@/components/dashboard/CommandCenter";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import {
    ClipboardList,
    Users,
    Settings2,
    AlertCircle,
    TrendingUp,
    Package
} from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

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
    const totalInventoryValue = usedItems.reduce(
        (total, item) => total + (item.quantity * item.priceAtTime),
        0
    );

    // 4. Alertas de Inventario
    const inventoryAlertsCount = await prisma.inventoryItem.count({
        where: {
            stock: { lte: prisma.inventoryItem.fields.minStock }
        }
    });

    // 5. Actividad Reciente (Últimas 10 acciones significativas)
    const recentOrders = await prisma.workOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
    });

    const recentReports = await prisma.workReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { workOrder: true }
    });

    const timelineItems = [
        ...recentOrders.map(o => ({
            id: o.id,
            type: 'ORDER_CREATED' as const,
            title: `Nueva Orden: ${o.deviceBrand}`,
            description: `${o.customer?.firstName} ${o.customer?.lastName} - ${o.reportedIssue}`,
            time: o.createdAt
        })),
        ...recentReports.map(r => ({
            id: r.id,
            type: 'REPORT_ADDED' as const,
            title: "Reporte Técnico",
            description: `Reparación finalizada para ${r.workOrder.deviceBrand} ${r.workOrder.deviceModel}`,
            time: r.createdAt,
            image: (r.images as string[])[0]
        }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

    // 6. Datos de exportación
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
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Upper Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                        Dashboard <span className="text-blue-600 italic">V2</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium italic uppercase tracking-tighter text-xs">
                        Operaciones de alto rendimiento impulsadas por <span className="text-slate-900 dark:text-zinc-300 font-bold underline">Servimaquinas Engineering</span>
                    </p>
                </div>
                <DashboardActions orders={ordersForExport} />
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-auto gap-4">

                {/* 1. Métricas Principales (Grid Izquierdo) */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatsSmall
                        title="Flujo Activo"
                        value={activeOrdersCount}
                        subtext="Equipos en taller"
                        color="bg-blue-100 text-blue-600"
                        icon={ClipboardList}
                    />
                    <StatsSmall
                        title="Base VIP"
                        value={vipCustomersCount}
                        subtext="Fidelización activa"
                        color="bg-amber-100 text-amber-600"
                        icon={Users}
                    />
                    <StatsSmall
                        title="Valor Invertido"
                        value={`$${totalInventoryValue.toLocaleString()}`}
                        subtext="Repuestos en tránsito"
                        color="bg-emerald-100 text-emerald-600"
                        icon={TrendingUp}
                    />
                    <StatsSmall
                        title="Alertas Stock"
                        value={inventoryAlertsCount}
                        subtext={inventoryAlertsCount > 0 ? "Reponer urgente" : "Suministros OK"}
                        color={inventoryAlertsCount > 0 ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600"}
                        icon={Package}
                    />
                </div>

                {/* 2. Command Center (Botones Gigantes) - Centro Derecha */}
                <div className="md:col-span-4 h-full">
                    <CommandCenter />
                </div>

                {/* 3. Panel de Actividad Visual (Centro-Abajo) */}
                <div className="md:col-span-7 lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Live Feed</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">ACTIVIDAD EN VIVO</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                    </div>
                    <ActivityTimeline items={timelineItems as any} />
                </div>

                {/* 4. Gráfico / Insights Operativos (Derecha-Abajo - MÁS COMPACTO) */}
                <div className="md:col-span-5 lg:col-span-4 bg-[#0073CF] rounded-[2.5rem] p-0.5 shadow-xl overflow-hidden relative group h-[400px]">
                    <div className="h-full w-full bg-white dark:bg-zinc-950 rounded-[2.4rem] p-6 flex flex-col justify-between border-4 border-transparent group-hover:border-blue-500/5 transition-all">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tighter uppercase italic leading-none">
                                    Performance
                                </h3>
                            </div>

                            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mb-4">
                                Operando al <span className="text-emerald-600 font-bold text-xs">87%</span> de capacidad técnica.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Cierre</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-zinc-200">2.4 d</p>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Satisf.</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-zinc-200">92%</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Blueprint (Smaller) */}
                        <div className="w-full h-24 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                            <div className="flex flex-col items-center">
                                <div className="flex gap-1 items-end h-8 mb-2">
                                    <div className="w-1 bg-blue-200 h-2" />
                                    <div className="w-1 bg-blue-300 h-4" />
                                    <div className="w-1 bg-blue-400 h-3" />
                                    <div className="w-1 bg-blue-500 h-6" />
                                    <div className="w-1 bg-blue-600 h-5" />
                                </div>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Analytics Engine Active</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
