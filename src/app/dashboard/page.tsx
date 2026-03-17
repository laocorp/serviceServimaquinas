import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DashboardActions from "./DashboardActions";
import StatsSmall from "@/components/dashboard/StatsSmall";
import CommandCenter from "@/components/dashboard/CommandCenter";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import {
    Users,
    TrendingUp,
    Package,
    Zap,
    Activity
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

    // 3. Valor en repuestos consumidos (usando totalPrice ya calculado en DB)
    const usedItems = await prisma.workOrderItem.findMany({
        select: { totalPrice: true },
    });
    const totalInventoryValue = usedItems.reduce(
        (total, item) => total + Number(item.totalPrice),
        0
    );

    // 4. Alertas de Inventario
    const inventoryAlertsCount = await prisma.inventoryItem.count({
        where: {
            quantity: { lte: 5 } // O usar un valor dinámico si se prefiere
        }
    });

    // 5. Actividad Reciente
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
            title: `Nueva Orden: ${o.brand || o.equipment}`,
            description: `${o.customer?.name} - ${o.description}`,
            time: o.createdAt
        })),
        ...recentReports.map(r => ({
            id: r.id,
            type: 'REPORT_ADDED' as const,
            title: "Reporte Técnico",
            description: `Reparación finalizada para ${r.workOrder.brand} ${r.workOrder.model}`,
            time: r.createdAt,
            image: (r.images as string[])[0]
        }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

    // 6. Datos de exportación
    const ordersForExport = await prisma.workOrder.findMany({
        select: {
            orderNumber: true,
            description: true,
            brand: true,
            model: true,
            status: true,
            createdAt: true,
            customer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-3 leading-none">
                        Dashboard <span className="text-blue-600 italic">V2</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium italic uppercase tracking-tighter text-[10px] md:text-xs leading-none">
                        Operaciones impulsadas por <span className="text-slate-900 dark:text-zinc-300 font-bold underline">Servimaquinas Engineering</span>
                    </p>
                </div>
                <DashboardActions orders={ordersForExport} />
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                {/* 1. Acciones Rápidas - Destacado en Móvil/Tablet */}
                <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-center min-h-[280px]">
                    <div className="mb-6">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            Operaciones rápidas
                        </h2>
                    </div>
                    <CommandCenter />
                </div>

                {/* 2. Métricas - Grid dinámico */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatsSmall title="Flujo Activo" value={activeOrdersCount} subtext="Equipos en taller" color="text-blue-500" icon={Activity} />
                    <StatsSmall title="Base VIP" value={vipCustomersCount} subtext="Fidelización activa" color="text-amber-500" icon={Users} />
                    <StatsSmall title="Inversión" value={`$${totalInventoryValue.toLocaleString()}`} subtext="Repuestos" color="text-emerald-500" icon={TrendingUp} />
                    <StatsSmall title="Alertas" value={inventoryAlertsCount} subtext={inventoryAlertsCount > 0 ? "Reponer stock" : "Suministros OK"} color="text-slate-500" icon={Package} />
                </div>

                {/* 3. Live Feed - Ocupa más espacio en desktop */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic leading-none">Live Feed</h2>
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-[10px] font-bold text-zinc-400">ACTIVIDAD EN VIVO</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <ActivityTimeline items={timelineItems as any} />
                    </div>
                </div>

                {/* 4. Performance - Analytics Card */}
                <div className="lg:col-span-4 bg-[#0073CF] rounded-[2.5rem] p-0.5 shadow-xl overflow-hidden group h-[400px]">
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
                            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mb-4 leading-normal">
                                Taller al <span className="text-emerald-600 font-bold text-xs border-b border-emerald-200">87%</span> de capacidad.
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
                        <div className="w-full h-24 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-pulse text-center px-4">Analytics Engine Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
