"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Table as TableIcon,
    Plus,
    MoreVertical,
    ChevronRight,
    ArrowRight,
    User,
    Package,
    AlertCircle,
    Calendar,
    Hammer,
    Wrench,
    CheckCircle2,
    Truck,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────
type OrderStatus = "PENDIENTE" | "EN_REVISION" | "EN_REPARACION" | "REPARADO" | "ENTREGADO" | "CANCELADO";

type Order = {
    id: string;
    orderNumber: string;
    equipment: string;
    brand: string | null;
    model: string | null;
    description: string;
    status: OrderStatus;
    createdAt: Date;
    customer: { name: string; isVIP: boolean };
    technician: { name: string } | null;
};

// ─── Configuración de columnas ────────────────────────────────────────────
const COLUMNS: { status: OrderStatus; label: string; color: string; dot: string; badge: string; icon: any }[] = [
    { status: "PENDIENTE", label: "Recibidos", color: "bg-slate-100/50 dark:bg-zinc-800/40", dot: "bg-zinc-400", badge: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", icon: Package },
    { status: "EN_REVISION", label: "Revisión", color: "bg-amber-50 dark:bg-amber-900/10", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Wrench },
    { status: "EN_REPARACION", label: "Reparando", color: "bg-blue-50 dark:bg-blue-900/10", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Hammer },
    { status: "REPARADO", label: "Reparados", color: "bg-emerald-50 dark:bg-emerald-900/10", dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
    { status: "ENTREGADO", label: "Entregados", color: "bg-indigo-50 dark:bg-indigo-900/10", dot: "bg-indigo-400", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Truck },
    { status: "CANCELADO", label: "Cancelados", color: "bg-red-50 dark:bg-red-900/10", dot: "bg-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
    PENDIENTE: "Recibido",
    EN_REVISION: "En Revisión",
    EN_REPARACION: "Reparando",
    REPARADO: "Reparado",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

// ─── Tarjeta de Orden ─────────────────────────────────────────────────────
function OrderCard({ order, onDragStart, onStatusChange }: {
    order: Order;
    onDragStart: (id: string) => void;
    onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}) {
    const dayAge = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 86400000);
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        if (!showActions) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
                setShowActions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showActions]);

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("orderId", order.id);
                onDragStart(order.id);
            }}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all cursor-grab active:cursor-grabbing select-none"
        >
            {/* Header de Tarjeta */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/30 uppercase tracking-widest">
                            {order.orderNumber}
                        </span>
                        {order.customer.isVIP && (
                            <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg border border-amber-100 dark:border-amber-800/30 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                VIP
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative" ref={actionsRef}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowActions(!showActions);
                        }}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActions && (
                        <div className="absolute top-0 right-8 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 min-w-[180px] animate-in fade-in slide-in-from-right-2 duration-200">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">Mover a:</p>
                            <div className="flex flex-col gap-0.5">
                                {COLUMNS.filter(c => c.status !== order.status).map(col => (
                                    <button
                                        key={col.status}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(order.id, col.status);
                                            setShowActions(false);
                                        }}
                                        className="text-left text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-3 transition-all active:scale-95"
                                    >
                                        <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                                        {col.label}
                                    </button>
                                ))}
                            </div>
                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                            <Link
                                href={`/dashboard/orders/${order.id}`}
                                className="text-left text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center gap-3 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                                Detalle Completo
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Información del Equipo */}
            <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-400" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase truncate">
                        {order.equipment}
                    </h4>
                </div>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-500 pl-6 border-l-2 border-blue-500/20 ml-2">
                    {order.brand} {order.model}
                </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-3 mb-4 border border-zinc-100 dark:border-zinc-800/50">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 font-medium">
                    {order.description}
                </p>
            </div>

            {/* Footer de Tarjeta */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden text-zinc-500">
                        <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-tighter truncate max-w-[100px]">
                            {order.customer.name}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest italic">
                            Cliente
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tight",
                        dayAge > 7 ? "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800" :
                            dayAge > 3 ? "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800" :
                                "text-zinc-500 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                    )}>
                        <Calendar className="w-2.5 h-2.5" />
                        {dayAge === 0 ? "HOY" : `${dayAge}D`}
                    </div>
                    {order.technician && (
                        <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 opacity-60 uppercase">
                            Tec: {order.technician.name.split(' ')[0]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Columna del Kanban ───────────────────────────────────────────────────
function KanbanColumn({
    column,
    orders,
    onDragStart,
    onDrop,
    isDragOver,
    onDragOver,
    onDragLeave,
    onStatusChange,
}: {
    column: typeof COLUMNS[0];
    orders: Order[];
    onDragStart: (id: string) => void;
    onDrop: (status: OrderStatus) => void;
    isDragOver: boolean;
    onDragOver: () => void;
    onDragLeave: () => void;
    onStatusChange: (id: string, s: OrderStatus) => void;
}) {
    return (
        <div className="flex flex-col gap-4 w-full h-full lg:min-w-[300px] xl:min-w-[320px]">
            {/* Header de columna en desktop */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-2">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", column.dot)} />
                <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-[0.2em]">{column.label}</h3>
                <span className={cn("ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg border", column.badge)}>
                    {orders.length}
                </span>
            </div>

            {/* Zona de drop */}
            <div
                onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
                onDragLeave={onDragLeave}
                onDrop={(e) => { e.preventDefault(); onDrop(column.status); }}
                className={cn(
                    "flex-1 flex flex-col gap-4 rounded-[2rem] p-4 transition-all duration-300 border-2 border-transparent lg:min-h-[500px]",
                    column.color,
                    isDragOver && "border-blue-400 bg-blue-100/30 dark:bg-blue-900/20 scale-[0.98] shadow-inner"
                )}
            >
                {orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10 grayscale py-12">
                        <Package className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Cola Vacía</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <OrderCard key={order.id} order={order} onDragStart={onDragStart} onStatusChange={onStatusChange} />
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Componente Principal ──────────────────────────────────────────────────
export default function OrdersBoard({ initialOrders, role = "TECNICO" }: { initialOrders: Order[]; role?: string }) {
    const [view, setView] = useState<"kanban" | "table">("kanban");
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);
    const [activeStatus, setActiveStatus] = useState<OrderStatus>("PENDIENTE");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status === newStatus) return;

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        startTransition(async () => {
            const res = await updateOrderStatus(orderId, newStatus);
            if (res && 'error' in res) {
                toast.error(res.error);
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: order.status } : o));
            } else {
                toast.success(`SM-${order.orderNumber} ahora en ${STATUS_LABEL[newStatus]}`);
            }
        });
    }

    const handleDrop = (newStatus: OrderStatus) => {
        if (!draggingId) return;
        handleStatusChange(draggingId, newStatus);
        setDraggingId(null);
        setDragOverCol(null);
    };

    return (
        <div className="flex flex-col min-h-screen relative -mx-4 sm:-mx-6 lg:mx-0">
            {/* Header Flotante / Dashboard-Native */}
            <div className="px-4 sm:px-6 lg:px-0 mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl p-2 shadow-lg">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tighter uppercase italic">
                                Gestión Técnica
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-400 pl-1">
                            <span>{orders.length} Órdenes Activas</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Selector de Vista */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setView("kanban")}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    view === "kanban" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md scale-[1.02]" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span className={cn(view !== "kanban" && "hidden sm:inline")}>Tablero</span>
                            </button>
                            <button
                                onClick={() => setView("table")}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    view === "table" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md scale-[1.02]" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span className={cn(view !== "table" && "hidden sm:inline")}>Lista</span>
                            </button>
                        </div>

                        {/* Botón Nueva */}
                        <Link
                            href="/dashboard/orders/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nueva Orden</span>
                        </Link>
                    </div>
                </div>

                {/* Sub-header de Filtros/QuickNav */}
                {view === "kanban" && (
                    <div className="lg:hidden">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                            {COLUMNS.map((col) => {
                                const Icon = col.icon;
                                const isActive = activeStatus === col.status;
                                return (
                                    <button
                                        key={col.status}
                                        onClick={() => setActiveStatus(col.status)}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[90px] aspect-square rounded-[1.75rem] border-2 transition-all p-3 gap-1",
                                            isActive
                                                ? "bg-slate-900 border-slate-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-slate-900 shadow-xl scale-105"
                                                : "bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-400"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter leading-tight text-center">
                                            {col.label}
                                        </span>
                                        <span className={cn("text-[10px] font-black", isActive ? "opacity-100" : "opacity-40")}>
                                            {orders.filter(o => o.status === col.status).length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Contenedor Principal de Pizarras */}
            <div className="px-4 sm:px-6 lg:px-0 flex-1 flex flex-col">
                {view === "kanban" ? (
                    <div className="flex-1 flex flex-col">
                        <div className="flex gap-6 lg:overflow-x-auto lg:pb-10 h-full">
                            {COLUMNS.map((col) => {
                                const isVisible = activeStatus === col.status;
                                return (
                                    <div
                                        key={col.status}
                                        className={cn(
                                            "flex-1 min-w-0 transition-all duration-500",
                                            isVisible ? "block" : "hidden lg:block",
                                            "lg:min-w-[320px] xl:min-w-[360px]"
                                        )}
                                    >
                                        <div className="lg:hidden flex items-center justify-between px-2 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-3 h-3 rounded-full", col.dot)} />
                                                <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100 uppercase italic">{col.label}</h2>
                                            </div>
                                            <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500">
                                                {orders.filter(o => o.status === col.status).length} Órdenes
                                            </span>
                                        </div>
                                        <KanbanColumn
                                            column={col}
                                            orders={orders.filter(o => o.status === col.status)}
                                            onDragStart={setDraggingId}
                                            onDrop={handleDrop}
                                            isDragOver={dragOverCol === col.status}
                                            onDragOver={() => setDragOverCol(col.status)}
                                            onDragLeave={() => setDragOverCol(null)}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <TableView orders={orders} />
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

// ─── Vista de Tabla (Simple/Responsivo) ──────────────────────────────────
function TableView({ orders }: { orders: Order[] }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm lg:mx-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <th className="px-8 py-5">Código</th>
                            <th className="px-6 py-5">Cliente & Detalles</th>
                            <th className="px-6 py-5 hidden md:table-cell">Equipo</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-8 py-5 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {orders.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-400 italic font-medium">No se encontraron órdenes registradas.</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-mono font-black text-slate-900 dark:text-zinc-200">#{order.orderNumber}</div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-tighter">
                                            {order.customer.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 sm:hidden mt-0.5">
                                            {order.equipment} - {order.brand}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 hidden md:table-cell">
                                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{order.equipment}</div>
                                    <div className="text-[10px] font-black text-blue-600 uppercase mt-0.5">{order.brand} / {order.model}</div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        order.status === "PENDIENTE" ? "bg-zinc-100 text-zinc-600" :
                                            order.status === "EN_REVISION" ? "bg-amber-100 text-amber-700" :
                                                order.status === "EN_REPARACION" ? "bg-blue-100 text-blue-700" :
                                                    order.status === "REPARADO" ? "bg-emerald-100 text-emerald-700" :
                                                        order.status === "ENTREGADO" ? "bg-indigo-100 text-indigo-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {STATUS_LABEL[order.status]}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest border-b-2 border-blue-600/10 hover:border-blue-600 transition-all pb-0.5"
                                    >
                                        Detalles
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
