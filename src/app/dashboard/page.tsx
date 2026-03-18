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
            image: (r.images as string[])?.length > 0 ? (r.images as string[])[0] : undefined
        }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

    // 6. Alertas de Mantenimiento (Próximos 30 días)
    const upcomingMaintenance = await prisma.customerTool.findMany({
        where: {
            nextMaintenance: {
                lte: new Date(new Date().setDate(new Date().getDate() + 30)),
                gte: new Date()
            }
        },
        include: { customer: true },
        take: 3,
        orderBy: { nextMaintenance: 'asc' }
    });

    // 7. Datos de exportación
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
                        <ActivityTimeline items={timelineItems} />
                    </div>
                </div>

                {/* 4. Mantenimientos Preventivos Bosch */}
                <div className="lg:col-span-4 bg-slate-900 dark:bg-black rounded-[2.5rem] p-6 shadow-xl overflow-hidden flex flex-col border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Preventivo Bosch
                        </h2>
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/20">30 DÍAS</span>
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        {upcomingMaintenance.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                                <Package className="w-8 h-8 text-slate-700 mb-2 opacity-50" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Todo en orden</p>
                                <p className="text-[9px] text-slate-600 mt-1">No hay mantenimientos venciendo pronto.</p>
                            </div>
                        ) : (
                            upcomingMaintenance.map((tool: any) => (
                                <div key={tool.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-blue-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{tool.name}</p>
                                            <p className="text-xs font-black text-white">{tool.brand} {tool.model}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Serial</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400">{tool.serialNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                {tool.customer?.name.charAt(0)}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-300 truncate max-w-[80px]">{tool.customer?.name}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-400">
                                            {tool.nextMaintenance ? new Date(tool.nextMaintenance).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. Performance - Analytics Card (Compartido o debajo) */}
                {/* ... existing code or similar ... */}
            </div>
        </div>
    );
}
