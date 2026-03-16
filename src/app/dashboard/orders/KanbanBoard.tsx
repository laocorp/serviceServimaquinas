"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────
type OrderStatus = "PENDIENTE" | "EN_REVISION" | "EN_REPARACION" | "REPARADO" | "ENTREGADO" | "CANCELADO";

type Order = {
    id: string;
    trackingCode: string;
    deviceBrand: string;
    deviceModel: string;
    reportedIssue: string;
    status: OrderStatus;
    createdAt: Date;
    customer: { firstName: string; lastName: string; isVIP: boolean };
    technician: { name: string } | null;
};

// ─── Configuración de columnas ────────────────────────────────────────────
const COLUMNS: { status: OrderStatus; label: string; color: string; dot: string; badge: string }[] = [
    { status: "PENDIENTE", label: "Recibidos", color: "bg-slate-100 dark:bg-zinc-800/60", dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
    { status: "EN_REVISION", label: "En Revisión", color: "bg-amber-50 dark:bg-amber-900/15", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    { status: "EN_REPARACION", label: "Reparando", color: "bg-blue-50 dark:bg-blue-900/15", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { status: "REPARADO", label: "Reparados", color: "bg-emerald-50 dark:bg-emerald-900/15", dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { status: "ENTREGADO", label: "Entregados", color: "bg-indigo-50 dark:bg-indigo-900/15", dot: "bg-indigo-400", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { status: "CANCELADO", label: "Cancelados", color: "bg-red-50 dark:bg-red-900/15", dot: "bg-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

// ─── Tarjeta de Orden ─────────────────────────────────────────────────────
function OrderCard({ order, onDragStart }: { order: Order; onDragStart: (id: string) => void }) {
    const dayAge = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 86400000);

    return (
        <div
            draggable
            onDragStart={() => onDragStart(order.id)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none group"
        >
            {/* Código + VIP */}
            <div className="flex items-start justify-between gap-2 mb-2.5">
                <span className="font-mono text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {order.trackingCode}
                </span>
                {order.customer.isVIP && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">🌟 VIP</span>
                )}
            </div>

            {/* Equipo */}
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                {order.deviceBrand} {order.deviceModel}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                {order.reportedIssue}
            </p>

            {/* Footer: cliente + tiempo */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-zinc-300">
                        {order.customer.firstName[0]}{order.customer.lastName[0]}
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {order.customer.firstName} {order.customer.lastName}
                    </span>
                </div>
                <span className={`text-[10px] font-semibold ${dayAge > 7 ? "text-red-500" : dayAge > 3 ? "text-amber-500" : "text-zinc-400"}`}>
                    {dayAge === 0 ? "Hoy" : `${dayAge}d`}
                </span>
            </div>

            {/* Técnico si está asignado */}
            {order.technician && (
                <div className="flex items-center gap-1 mt-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-[10px] text-blue-500 font-medium">{order.technician.name}</span>
                </div>
            )}

            {/* Link a detalle (visible al hover) */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/orders/${order.id}`}
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-blue-500 hover:text-blue-700 font-medium">
                    Ver detalle →
                </Link>
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
}: {
    column: typeof COLUMNS[0];
    orders: Order[];
    onDragStart: (id: string) => void;
    onDrop: (status: OrderStatus) => void;
    isDragOver: boolean;
    onDragOver: () => void;
    onDragLeave: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 min-w-[240px] flex-1">
            {/* Header de columna */}
            <div className="flex items-center gap-2 px-1">
                <span className={`w-2 h-2 rounded-full ${column.dot} flex-shrink-0`} />
                <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">{column.label}</h3>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>
                    {orders.length}
                </span>
            </div>

            {/* Zona de drop */}
            <div
                onDragOver={e => { e.preventDefault(); onDragOver(); }}
                onDragLeave={onDragLeave}
                onDrop={() => onDrop(column.status)}
                className={`flex-1 min-h-[120px] flex flex-col gap-2.5 rounded-2xl p-2 transition-all duration-200 ${column.color} ${isDragOver
                    ? "ring-2 ring-blue-400 ring-offset-1 scale-[1.01]"
                    : ""
                    }`}
            >
                {orders.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">Sin órdenes</p>
                    </div>
                )}
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
}

// ─── Vista de Tabla ───────────────────────────────────────────────────────
const STATUS_BADGE: Record<OrderStatus, string> = {
    PENDIENTE: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    EN_REVISION: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    EN_REPARACION: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    REPARADO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    ENTREGADO: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    CANCELADO: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_LABEL: Record<OrderStatus, string> = {
    PENDIENTE: "Recibido",
    EN_REVISION: "En Revisión",
    EN_REPARACION: "Reparando",
    REPARADO: "Reparado",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

function TableView({ orders }: { orders: Order[] }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            {["Código", "Cliente", "Equipo", "Estado", "Responsable", ""].map(h => (
                                <th key={h} className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No hay órdenes de reparación.</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-xs">
                                        {order.trackingCode}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 dark:text-zinc-200">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </div>
                                    {order.customer.isVIP && <div className="text-[10px] font-bold text-amber-600 mt-0.5">🌟 VIP</div>}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    <div className="font-medium text-slate-700 dark:text-zinc-300">{order.deviceBrand} {order.deviceModel}</div>
                                    <div className="text-xs truncate max-w-[160px]">{order.reportedIssue}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_BADGE[order.status]}`}>
                                        {STATUS_LABEL[order.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500">
                                    {order.technician?.name ?? <span className="text-xs italic text-zinc-400">No asignado</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/orders/${order.id}`} className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors">
                                        Ver →
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

// ─── Componente principal ─────────────────────────────────────────────────
export default function OrdersBoard({ initialOrders, role = "TECNICO" }: { initialOrders: Order[]; role?: string }) {
    const [view, setView] = useState<"kanban" | "table">("kanban");
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDrop = (newStatus: OrderStatus) => {
        if (!draggingId) return;
        const order = orders.find(o => o.id === draggingId);
        if (!order || order.status === newStatus) {
            setDraggingId(null);
            setDragOverCol(null);
            return;
        }

        // Actualización optimista
        setOrders(prev => prev.map(o => o.id === draggingId ? { ...o, status: newStatus } : o));
        setDraggingId(null);
        setDragOverCol(null);

        // Persistir en DB
        startTransition(async () => {
            const res = await updateOrderStatus(draggingId, newStatus);
            if (res && 'error' in res) {
                toast.error(res.error);
                // Revertir en caso de error
                setOrders(prev => prev.map(o => o.id === draggingId ? { ...o, status: order.status } : o));
            } else {
                toast.success(`Orden movida a "${STATUS_LABEL[newStatus]}"`);
            }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Órdenes de Trabajo</h1>
                    <p className="text-zinc-500 mt-1">
                        {orders.length} orden{orders.length !== 1 ? "es" : ""} registradas
                        {isPending && <span className="ml-2 text-blue-500 text-xs">Actualizando...</span>}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle Vista */}
                    <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl gap-1">
                        <button
                            onClick={() => setView("kanban")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "kanban"
                                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="4" height="7" rx="1" />
                            </svg>
                            Kanban
                        </button>
                        <button
                            onClick={() => setView("table")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "table"
                                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" />
                            </svg>
                            Tabla
                        </button>
                    </div>

                    {/* Nueva Orden */}
                    {role !== "TECNICO" && (
                        <Link href="/dashboard/orders/new"
                            className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nueva Orden
                        </Link>
                    )}
                </div>
            </div>

            {/* Vista Kanban */}
            {view === "kanban" && (
                <div className="flex gap-3 overflow-x-auto pb-4">
                    {COLUMNS.map(col => (
                        <KanbanColumn
                            key={col.status}
                            column={col}
                            orders={orders.filter(o => o.status === col.status)}
                            onDragStart={setDraggingId}
                            onDrop={handleDrop}
                            isDragOver={dragOverCol === col.status}
                            onDragOver={() => setDragOverCol(col.status)}
                            onDragLeave={() => setDragOverCol(null)}
                        />
                    ))}
                </div>
            )}

            {/* Vista Tabla */}
            {view === "table" && <TableView orders={orders} />}
        </div>
    );
}
