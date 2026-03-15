import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function InventoryPage() {
    const session = await auth();
    const role = session?.user?.role || "TECNICO";
    const canEdit = role !== "TECNICO";

    // Fetch real data from the database
    const items = await prisma.inventoryItem.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Inventario</h1>
                    <p className="text-zinc-500 mt-1">Gestiona repuestos, insumos y unidades disponibles.</p>
                </div>

                {canEdit && (
                    <Link href="/dashboard/inventory/new" className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nuevo Artículo
                    </Link>
                )}
            </div>

            {/* Tabla de Inventario */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Código</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Nombre</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Precio</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Stock Actual</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Estado</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No hay artículos en el inventario aún. Crea tu primer repuesto.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: any) => {
                                    const isLowStock = item.stock <= item.minStock;
                                    const isOutOfStock = item.stock === 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-zinc-500 dark:text-zinc-400">{item.code}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-zinc-200">{item.name}</td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">${item.price.toLocaleString('es-CO')}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-200">{item.stock}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${isOutOfStock
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : isLowStock
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                    {isOutOfStock ? 'Agotado' : isLowStock ? 'Stock Bajo' : 'Disponible'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/inventory/${item.id}`} className="text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors p-2 font-medium">
                                                    {canEdit ? "Editar" : "Ver Detalle"}
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
