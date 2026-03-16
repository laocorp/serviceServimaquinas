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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Inventario</h1>
                    <p className="text-zinc-500 mt-1">Gestiona repuestos, insumos y unidades disponibles.</p>
                </div>

                {canEdit && (
                    <Link href="/dashboard/inventory/new" className="flex items-center justify-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 w-full sm:w-auto">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nuevo Artículo
                    </Link>
                )}
            </div>

            {/* Tabla de Inventario */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    <table className="w-full text-left text-sm min-w-[700px]">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Código</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Nombre</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Precio</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-center">Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Estado</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                        No hay artículos en el inventario aún. Crea tu primer repuesto.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: any) => {
                                    const isLowStock = item.stock <= item.minStock;
                                    const isOutOfStock = item.stock === 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">{item.code}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-zinc-200">{item.name}</td>
                                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-zinc-400">${item.price.toLocaleString('es-CO')}</td>
                                            <td className="px-6 py-4 font-black text-slate-950 dark:text-white text-center">{item.stock}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${isOutOfStock
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : isLowStock
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                    {isOutOfStock ? 'Sold Out' : isLowStock ? 'Low Stock' : 'Ready'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/inventory/${item.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                                                    {canEdit ? "Editar" : "Ver"}
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
