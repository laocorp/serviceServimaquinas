"use client";

import Link from "next/link";

interface OrderExport {
    orderNumber: string;
    description: string;
    brand: string | null;
    model: string | null;
    status: string;
    createdAt: Date;
    customer: { name: string } | null;
}

export default function DashboardActions({ orders }: { orders: OrderExport[] }) {

    const handleExport = () => {
        // Construir CSV
        const headers = ["Código", "Cliente", "Marca", "Modelo", "Problema", "Estado", "Fecha"];
        const rows = orders.map(o => [
            o.orderNumber,
            o.customer ? o.customer.name : "Sin cliente",
            o.brand || "---",
            o.model || "---",
            (o.description ?? "").replace(/,/g, ";"),
            o.status,
            new Date(o.createdAt).toLocaleDateString("es-CO"),
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(","))
            .join("\n");

        // Disparar descarga
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ordenes_servimaquinas_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex gap-3">
            {/* Exportar CSV */}
            <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar
            </button>

            {/* Nueva Orden → navega a /dashboard/orders/new */}
            <Link
                href="/dashboard/orders/new"
                className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva Orden
            </Link>
        </div>
    );
}
